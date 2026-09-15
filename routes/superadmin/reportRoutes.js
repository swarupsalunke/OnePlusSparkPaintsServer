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
  downloadScheduledReport,
  deleteReport,
  deleteScheduledReport,
} = require("../../controllers/superadmin/reportController");

const uploadReport = require("../../middleware/uploadReport");

const router = express.Router();


// =====================================================
// REPORT DASHBOARD
// =====================================================

router.get("/dashboard", getReportDashboard);


// =====================================================
// RECENT REPORTS
// =====================================================

// Get all recent reports
router.get("/", getReports);

// Create / upload new report
router.post(
  "/",
  uploadReport.single("reportFile"),
  createReport
);

// Get single report
router.get("/:id", getReportById);

// Update report + optional new file
router.put(
  "/:id",
  uploadReport.single("reportFile"),
  updateReport
);

// Mark report as downloaded
router.get("/:id/download", downloadReport);


// =====================================================
// SCHEDULED REPORTS
// =====================================================

// Get scheduled reports
router.get("/scheduled/list", getScheduledReports);

// Create scheduled report
router.post("/scheduled", createScheduledReport);

// Update scheduled report
router.put(
  "/scheduled/:id",
  updateScheduledReport
);

// Download scheduled report
router.get(
  "/scheduled/:id/download",
  downloadScheduledReport
);

// Delete report
router.delete("/:id", deleteReport);

// Delete scheduled report
router.delete(
  "/scheduled/:id",
  deleteScheduledReport
);


module.exports = router;