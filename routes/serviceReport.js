const express = require("express");
const router = express.Router();
const ServiceReport = require("../models/ServiceReport");
const authMiddleware = require("../middleware/authMiddleware");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer S3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "private", // or 'public-read' if you want it public
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `service-reports/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

// Route: Upload service report (PDF to S3, details to MongoDB)
router.post("/serviceReport", authMiddleware, upload.single("pdf"), async (req, res) => {
  try {
    const { reportName, reportNumber, date, customerName } = req.body;

    if (!req.file) return res.status(400).json({ error: "PDF file is required" });

    const newReport = new ServiceReport({
      reportName,
      reportNumber,
      date,
      pdfUrl: req.file.location,
      key: req.file.key,
      customer: {
        name: customerName,
      },
      storedBy: req.user._id, // comes from auth middleware
    });

    await newReport.save();

    res.status(201).json(newReport);
  } catch (error) {
    console.error("Error uploading report:", error);
    res.status(500).json({ error: "Server error while uploading report" });
  }
});

module.exports = router;
