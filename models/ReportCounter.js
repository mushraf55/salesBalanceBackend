// models/ReportCounter.js
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  name: { type: String, default: "report" },
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model("ReportCounter", counterSchema);
