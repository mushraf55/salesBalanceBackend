const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const { sendReorderEmail } = require("../mailSystem"); // ⬅️ Import this

// Sell Product (admin and sales)
router.post("/sell", authMiddleware(["admin", "sales"]), async (req, res) => {
  const { date, product, quantity, price, customer, po, invoice } = req.body;
  const { name } = req.user;

  if (!product || !quantity || !price || !customer) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  if (quantity <= 0 || isNaN(quantity)) {
    return res.status(400).json({ error: "Quantity should be a positive number" });
  }

  if (price <= 0 || isNaN(price)) {
    return res.status(400).json({ error: "Price should be a positive number" });
  }

  try {
    const productInStock = await Product.findOne({ product });

    if (!productInStock) {
      return res.status(404).json({ error: "Product not found in stock" });
    }

    if (productInStock.quantity < quantity) {
      return res.status(400).json({ error: "Insufficient stock available" });
    }

    const subtotal = price * quantity;
    const vat = parseFloat((subtotal * 0.05).toFixed(2));
    const total = parseFloat((subtotal + vat).toFixed(2));

    const sale = new Sale({
      date,
      product,
      quantity,
      price,
      customer,
      vat,
      total,
      po,
      invoice,
      soldBy: name,
    });

    await sale.save();

    // Deduct quantity from stock
    productInStock.quantity -= quantity;
    await productInStock.save();

    // ✅ Trigger reorder email if quantity falls below or equal to reorder level
    if (productInStock.quantity <= productInStock.reorder) {
      await sendReorderEmail(productInStock.product, productInStock.quantity, productInStock.reorder);
      console.log("🔔 Reorder email triggered after sale for:", productInStock.product);
    }

    res.status(201).json({
      success: true,
      message: "Product sold successfully!",
      sale,
    });
  } catch (err) {
    console.error("Error during sale:", err);
    res.status(500).json({ error: "Failed to sell product. Please try again." });
  }
});
module.exports = router;
