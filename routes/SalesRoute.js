const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose"); // for transactions

// Sell Product (admin and sales)
router.post("/sell", authMiddleware(["admin", "sales"]), async (req, res) => {
  const { date, product, quantity, price, customer, po, invoice } = req.body;
  const { name } = req.user; // Get the name of the person selling the product

  // Validate required fields
  if (!product || !quantity || !price || !customer) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  // Ensure quantity and price are valid
  if (quantity <= 0 || isNaN(quantity)) {
    return res.status(400).json({ error: "Quantity should be a positive number" });
  }

  if (price <= 0 || isNaN(price)) {
    return res.status(400).json({ error: "Price should be a positive number" });
  }

  try {
    // Find the product in the available stock
    const productInStock = await Product.findOne({ product });

    if (!productInStock) {
      return res.status(404).json({ error: "Product not found in stock" });
    }

    // Check if sufficient quantity is available
    if (productInStock.quantity < quantity) {
      return res.status(400).json({ error: "Insufficient stock available" });
    }

    // Record the sale
    const sale = new Sale({
      date,
      product,
      quantity,
      price,
      customer,
      po,
      invoice,
      soldBy: name,
    });

    // Save the sale
    await sale.save();

    // Deduct the quantity from available stock
    productInStock.quantity -= quantity;
    await productInStock.save();

    // Send the response
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


// Get Sold Items
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    console.error("Error fetching sales:", err);
    res.status(500).json({ error: "Failed to fetch sales data" });
  }
});

module.exports = router;
