// routes/reportNumber.js
const express = require("express");
const router = express.Router();
const ReportCounter = require("../models/ReportCounter");

router.get("/generate-report-no", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Find or create a counter for the current year
    let counter = await ReportCounter.findOne({ name: `report-${currentYear}` });

    if (!counter) {
      counter = new ReportCounter({ name: `report-${currentYear}`, seq: 0 });
    }

    counter.seq += 1;
    await counter.save();

    const reportNo = `AZ-${currentYear}${String(counter.seq).padStart(3, "0")}`;

    res.status(200).json({ reportNo });
  } catch (error) {
    console.error("Error generating report number:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
