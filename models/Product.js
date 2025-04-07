const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  date: Date,
  proforma: String,
  product: String,
  quantity: Number,
  price: Number,
  oem: String,
  reorder: Number,
  addedBy: String, // name of the admin
});

module.exports = mongoose.model("Product", productSchema);
