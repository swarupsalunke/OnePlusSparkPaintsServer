const express = require("express");

const {
  getReportDashboard,
  getReports,
  createReport,
  getReportById,
  updateReport,
  downloadReport,
  getScheduledReports,
  createScheduledReport,
  updateScheduledReport,
  deleteScheduledReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/dashboard", getReportDashboard);

// ===============================
// RECENT REPORTS
// ===============================
router.get("/", getReports);

router.post("/", createReport);

router.get("/:id", getReportById);

router.put("/:id", updateReport);

router.get("/:id/download", downloadReport);

// ===============================
// SCHEDULED REPORTS
// ===============================
router.get("/scheduled/list", getScheduledReports);

router.post("/scheduled", createScheduledReport);

router.put("/scheduled/:id", updateScheduledReport);

router.delete("/scheduled/:id", deleteScheduledReport);

module.exports = router;