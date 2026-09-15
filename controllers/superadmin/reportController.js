const Report = require("../../models/superadmin/Report");
const ScheduledReport = require("../../models/superadmin/ScheduledReport");
const fs = require("fs");
const path = require("path");

// =====================================================
// REPORT FILE HELPERS
// =====================================================

const getUploadedFilePath = (fileName) => {
  if (!fileName) return null;

  return path.join(
    __dirname,
    "../uploads/reports",
    fileName
  );
};

const deleteReportFile = (fileName) => {
  if (!fileName) return;

  const filePath = getUploadedFilePath(fileName);

  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};


// =====================================================
// REPORT DASHBOARD
// =====================================================

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


// =====================================================
// GET RECENT REPORTS
// =====================================================

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


// =====================================================
// CREATE / GENERATE REPORT
// =====================================================

exports.createReport = async (req, res) => {
  try {
    const {
      reportName,
      category,
      reportType,
      generatedBy,
      format,
    } = req.body;

    // Validate required file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Report file is required",
      });
    }

    // Validate format
    const normalizedFormat = String(format || "").toUpperCase();

    if (!["PDF", "EXCEL", "CSV"].includes(normalizedFormat)) {
      deleteReportFile(req.file.filename);

      return res.status(400).json({
        success: false,
        message: "Invalid report format",
      });
    }

    // Validate uploaded file extension against selected format
    const uploadedExtension = path
      .extname(req.file.originalname)
      .toLowerCase();

    const formatExtensions = {
      PDF: [".pdf"],
      EXCEL: [".xlsx", ".xls"],
      CSV: [".csv"],
    };

    if (
      !formatExtensions[normalizedFormat].includes(
        uploadedExtension
      )
    ) {
      deleteReportFile(req.file.filename);

      return res.status(400).json({
        success: false,
        message: `Selected format ${normalizedFormat} does not match uploaded file`,
      });
    }

    const report = await Report.create({
      reportName,
      category,
      reportType,
      generatedBy,
      format: normalizedFormat,

      fileName: req.file.filename,

      filePath: `uploads/reports/${req.file.filename}`,

      originalFileName: req.file.originalname,
    });

    res.status(201).json({
      success: true,
      message: "Report generated successfully",
      report,
    });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file?.filename) {
      deleteReportFile(req.file.filename);
    }

    console.error("Create report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
};


// =====================================================
// GET SINGLE REPORT
// =====================================================

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


// =====================================================
// UPDATE REPORT
// =====================================================

exports.updateReport = async (req, res) => {
  try {
    const {
      reportName,
      category,
      reportType,
      generatedBy,
      format,
    } = req.body;

    const existingReport = await Report.findById(
      req.params.id
    );

    if (!existingReport) {
      // If multer uploaded a file but report doesn't exist,
      // remove the newly uploaded file.
      if (req.file?.filename) {
        deleteReportFile(req.file.filename);
      }

      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const normalizedFormat = String(
      format || existingReport.format || ""
    ).toUpperCase();

    if (!["PDF", "EXCEL", "CSV"].includes(normalizedFormat)) {
      if (req.file?.filename) {
        deleteReportFile(req.file.filename);
      }

      return res.status(400).json({
        success: false,
        message: "Invalid report format",
      });
    }

    const updateData = {
      reportName,
      category,
      reportType,
      generatedBy,
      format: normalizedFormat,
    };

    // -------------------------------------------------
    // NEW FILE UPLOADED
    // -------------------------------------------------

    if (req.file) {
      const uploadedExtension = path
        .extname(req.file.originalname)
        .toLowerCase();

      const formatExtensions = {
        PDF: [".pdf"],
        EXCEL: [".xlsx", ".xls"],
        CSV: [".csv"],
      };

      if (
        !formatExtensions[normalizedFormat].includes(
          uploadedExtension
        )
      ) {
        deleteReportFile(req.file.filename);

        return res.status(400).json({
          success: false,
          message: `Selected format ${normalizedFormat} does not match uploaded file`,
        });
      }

      updateData.fileName = req.file.filename;

      updateData.filePath =
        `uploads/reports/${req.file.filename}`;

      updateData.originalFileName =
        req.file.originalname;
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    // -------------------------------------------------
    // DELETE OLD FILE AFTER SUCCESSFUL UPDATE
    // -------------------------------------------------

    if (
      req.file &&
      existingReport.fileName &&
      existingReport.fileName !== req.file.filename
    ) {
      deleteReportFile(existingReport.fileName);
    }

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      report: updatedReport,
    });
  } catch (error) {
    // If update failed after multer uploaded a new file,
    // remove that new file.
    if (req.file?.filename) {
      deleteReportFile(req.file.filename);
    }

    console.error("Update report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update report",
      error: error.message,
    });
  }
};


// =====================================================
// MARK REPORT AS DOWNLOADED
// =====================================================

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


// =====================================================
// GET SCHEDULED REPORTS
// =====================================================

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


// =====================================================
// CREATE SCHEDULED REPORT
// =====================================================

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


// =====================================================
// UPDATE SCHEDULED REPORT
// =====================================================

exports.updateScheduledReport = async (req, res) => {
  try {
    const scheduledReport =
      await ScheduledReport.findByIdAndUpdate(
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

// =====================================================
// DOWNLOAD SCHEDULED REPORT
// =====================================================

// =====================================================
// DOWNLOAD SCHEDULED REPORT
// =====================================================

exports.downloadScheduledReport = async (req, res) => {
  try {
    const scheduledReport =
      await ScheduledReport.findById(req.params.id);

    if (!scheduledReport) {
      return res.status(404).json({
        success: false,
        message: "Scheduled report not found",
      });
    }

    const { format } = scheduledReport;

    if (!["PDF", "EXCEL"].includes(format)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported report format",
      });
    }

    /*
      Actual PDF / Excel generation will be connected here
      once the corresponding report data source is available.
    */

    return res.status(200).json({
      success: true,
      message: "Scheduled report found",
      scheduledReport,
      format,
    });
  } catch (error) {
    console.error(
      "Download scheduled report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to download scheduled report",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE REPORT
// =====================================================

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    // Report not found
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Delete uploaded file from server
    if (report.fileName) {
      deleteReportFile(report.fileName);
    }

    // Delete report from database
    await Report.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete report",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE SCHEDULED REPORT
// =====================================================

exports.deleteScheduledReport = async (req, res) => {
  try {
    const scheduledReport =
      await ScheduledReport.findByIdAndDelete(
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