const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  date: Date,
  product: String,
  quantity: Number,
  price: Number,
  customer: String,
  vat: Number,          
  total: Number, 
  po: String,
  invoice: String,
  soldBy: String, // name of seller (admin or salesperson)
});

module.exports = mongoose.model("Sale", saleSchema);
