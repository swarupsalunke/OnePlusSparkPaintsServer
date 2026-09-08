const Report = require("../models/Report");
const ScheduledReport = require("../models/ScheduledReport");

exports.getReportDashboard = async (req, res) => {
  try {
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const [
      totalReports,
      generatedThisMonth,
      scheduledReports,
      downloadedThisMonth,
    ] = await Promise.all([
      Report.countDocuments(),

      Report.countDocuments({
        generatedOn: {
          $gte: startOfMonth,
          $lte: now,
        },
      }),

      ScheduledReport.countDocuments(),

      Report.countDocuments({
        downloaded: true,
        updatedAt: {
          $gte: startOfMonth,
          $lte: now,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      dashboard: {
        totalReports,
        generatedThisMonth,
        scheduledReports,
        downloadedThisMonth,
      },
    });
  } catch (error) {
    console.error("Get report dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch report dashboard",
      error: error.message,
    });
  }
};


// ===============================
// GET RECENT REPORTS
// ===============================
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ generatedOn: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get reports error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};


// ===============================
// CREATE / GENERATE REPORT
// ===============================
exports.createReport = async (req, res) => {
  try {
    const {
      reportName,
      category,
      reportType,
      generatedBy,
      format,
    } = req.body;

    const report = await Report.create({
      reportName,
      category,
      reportType,
      generatedBy,
      format,
    });

    res.status(201).json({
      success: true,
      message: "Report generated successfully",
      report,
    });
  } catch (error) {
    console.error("Create report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
};


// ===============================
// GET SINGLE REPORT
// ===============================
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get report by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE REPORT
// ===============================
exports.updateReport = async (req, res) => {
  try {
    const {
      reportName,
      category,
      reportType,
      generatedBy,
      format,
    } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        reportName,
        category,
        reportType,
        generatedBy,
        format,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    console.error("Update report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update report",
      error: error.message,
    });
  }
};


// ===============================
// MARK REPORT AS DOWNLOADED
// ===============================
exports.downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    report.downloaded = true;

    await report.save();

    res.status(200).json({
      success: true,
      message: "Report download recorded successfully",
      report,
    });
  } catch (error) {
    console.error("Download report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to download report",
      error: error.message,
    });
  }
};


// ===============================
// GET SCHEDULED REPORTS
// ===============================
exports.getScheduledReports = async (req, res) => {
  try {
    const reports = await ScheduledReport.find()
      .sort({ nextRun: 1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      scheduledReports: reports,
    });
  } catch (error) {
    console.error("Get scheduled reports error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch scheduled reports",
      error: error.message,
    });
  }
};


// ===============================
// CREATE SCHEDULED REPORT
// ===============================
exports.createScheduledReport = async (req, res) => {
  try {
    const {
      reportName,
      category,
      schedule,
      nextRun,
      format,
      recipients,
      status,
    } = req.body;

    const scheduledReport = await ScheduledReport.create({
      reportName,
      category,
      schedule,
      nextRun,
      format,
      recipients,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Scheduled report created successfully",
      scheduledReport,
    });
  } catch (error) {
    console.error("Create scheduled report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create scheduled report",
      error: error.message,
    });
  }
};


// ===============================
// UPDATE SCHEDULED REPORT
// ===============================
exports.updateScheduledReport = async (req, res) => {
  try {
    const scheduledReport = await ScheduledReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!scheduledReport) {
      return res.status(404).json({
        success: false,
        message: "Scheduled report not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Scheduled report updated successfully",
      scheduledReport,
    });
  } catch (error) {
    console.error("Update scheduled report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update scheduled report",
      error: error.message,
    });
  }
};


// ===============================
// DELETE SCHEDULED REPORT
// ===============================
exports.deleteScheduledReport = async (req, res) => {
  try {
    const scheduledReport = await ScheduledReport.findByIdAndDelete(
      req.params.id
    );

    if (!scheduledReport) {
      return res.status(404).json({
        success: false,
        message: "Scheduled report not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Scheduled report deleted successfully",
    });
  } catch (error) {
    console.error("Delete scheduled report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete scheduled report",
      error: error.message,
    });
  }
};