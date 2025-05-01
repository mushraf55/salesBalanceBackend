require("dotenv").config(); // Load .env variables first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 7500;

const productRoutes = require("./routes/ProductRoute");
const saleRoutes = require("./routes/SalesRoute");
const authRoutes = require("./routes/auth");
const ReportNoRoutes = require("./routes/GenerateReportNo")

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // Auth route handles login/signup
app.use("/api/products", productRoutes); // Auth handled inside each route
app.use("/api/sales", saleRoutes); // Same here if applicable
app.use("/api/reportNumber", ReportNoRoutes)

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
