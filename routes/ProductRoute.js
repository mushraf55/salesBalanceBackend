const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const { sendReorderEmail } = require("../mailSystem"); // Import the sendReorderEmail function

// Add Product (admin only)
router.post("/", authMiddleware(["admin"]), async (req, res) => {
    const { date, proforma, product, quantity, price, oem, reorder } = req.body;
    const { name } = req.user; // Get the name of the logged-in admin
  
    try {
        // Check if the product already exists
        const existingProduct = await Product.findOne({ product: product });
        if (existingProduct) {
            // If the product exists, just update the quantity
            existingProduct.quantity += quantity;
            await existingProduct.save();
            
            // Check reorder level and send email if necessary
            if (existingProduct.quantity <= existingProduct.reorder) {
                await sendReorderEmail(existingProduct.product, existingProduct.quantity, existingProduct.reorder);
            }
            
            return res.status(200).json(existingProduct);
        }

        // Create a new product if it doesn't exist
        const newProduct = new Product({
            date,
            proforma,
            product,
            quantity,
            price,
            oem,
            reorder,
            addedBy: name,
        });

        await newProduct.save();
        
        // Check reorder level and send email if necessary
        if (newProduct.quantity <= newProduct.reorder) {
            await sendReorderEmail(newProduct.product, newProduct.quantity, newProduct.reorder);
        }

        res.status(201).json(newProduct);
    } catch (err) {
        console.error("Error while adding product:", err);
        res.status(500).json({ error: "Failed to add product", details: err.message });
    }
});

// Get All Products (for both admin and salespeople)
router.get("/", authMiddleware(["admin", "sales"]), async (req, res) => {
    try {
        // Fetch all products (including those with quantity > 0)
        const allProducts = await Product.find();

        if (allProducts.length === 0) {
            return res.status(404).json({ error: "No products found" });
        }

        res.status(200).json(allProducts);
    } catch (err) {
        console.error("Error while fetching products:", err);
        res.status(500).json({ error: "Failed to fetch products", details: err.message });
    }
});

// Update Product by ID (admin and sales)
router.patch("/:id", authMiddleware(["admin", "sales"]), async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
  
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
  
        // Ensure the quantity is a valid number
        if (isNaN(quantity) || quantity < 0) {
            return res.status(400).json({ error: "Invalid quantity value" });
        }
  
        // Update the product quantity
        product.quantity = quantity;
  
        // Save the updated product
        const updatedProduct = await product.save();
  
        // ✅ Check reorder level and send email if necessary
        if (updatedProduct.quantity <= updatedProduct.reorder) {
            console.log("🔔 Reorder email triggered for", updatedProduct.product);
            await sendReorderEmail(updatedProduct.product, updatedProduct.quantity, updatedProduct.reorder);
        }
  
        res.status(200).json(updatedProduct);
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ error: "Failed to update product stock", details: err.message });
    }
});

module.exports = router;
