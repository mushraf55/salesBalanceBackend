const mongoose = require("mongoose");

const ServiceReportSchema = new mongoose.Schema({
    reportName: {
        type: String,
        required: true,
        trim: true
    },
    reportNumber: {
        type: Number,
        required: true,
        unique: true
    },
    pdfUrl: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    date: {  
        type: Date,
        required: true
    },
    customer: {
        name: {
            type: String,
            required: true,
            trim: true
        },
    },
    storedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("ServiceReport", ServiceReportSchema);
