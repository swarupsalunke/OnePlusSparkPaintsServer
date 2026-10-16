const DailyCashReport = require("../models/DailyCashReport");

const createDailyCashReport = async (req, res) => {
  try {
    const {
      reportDate,
      reportTime,
      shift,
      branch,
      storeName,
      cashierName,
      status,
      openingCashBalance,
      openingOnlineBalance,
      collections,
      totalReceipt,
      creditBills,
      expenses,
      totalExpenses,
      advanceSalary,
      totalAdvanceSalary,
      officeTransfer,
      purchaseBills,
      totalPurchaseAmount,
      closingBalance,
      documents,
      remarks,
    } = req.body;

    // Required fields
    if (
      !reportDate ||
      !reportTime ||
      !shift ||
      !branch ||
      !storeName ||
      !cashierName
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required report information",
      });
    }

    const report = await DailyCashReport.create({
      reportDate,
      reportTime,
      shift,
      branch,
      storeName,
      cashierName,
      status,
      openingCashBalance,
      openingOnlineBalance,
      collections,
      totalReceipt,
      creditBills,
      expenses,
      totalExpenses,
      advanceSalary,
      totalAdvanceSalary,
      officeTransfer,
      purchaseBills,
      totalPurchaseAmount,
      closingBalance,
      documents,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: "Daily cash report created successfully",
      report,
    });
  } catch (error) {
    console.error("Create daily cash report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create daily cash report",
    });
  }
};


// ==========================================
// GET ALL DAILY CASH REPORTS
// ==========================================

const getDailyCashReports = async (req, res) => {
  try {
    const {
      search,
      status,
      branch,
      storeName,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (branch) {
      filter.branch = branch;
    }

    if (storeName) {
      filter.storeName = storeName;
    }

    if (search) {
      filter.$or = [
        {
          storeName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          cashierName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          branch: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const reports = await DailyCashReport.find(filter).sort({
      reportDate: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get daily cash reports error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch daily cash reports",
    });
  }
};


// ==========================================
// GET SINGLE DAILY CASH REPORT
// ==========================================

const getDailyCashReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await DailyCashReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Daily cash report not found",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get daily cash report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch daily cash report",
    });
  }
};


// ==========================================
// UPDATE DAILY CASH REPORT
// ==========================================

const updateDailyCashReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await DailyCashReport.findByIdAndUpdate(
      id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Daily cash report not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Daily cash report updated successfully",
      report,
    });
  } catch (error) {
    console.error("Update daily cash report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update daily cash report",
    });
  }
};


// ==========================================
// DELETE DAILY CASH REPORT
// ==========================================

const deleteDailyCashReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await DailyCashReport.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Daily cash report not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Daily cash report deleted successfully",
    });
  } catch (error) {
    console.error("Delete daily cash report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete daily cash report",
    });
  }
};


module.exports = {
  createDailyCashReport,
  getDailyCashReports,
  getDailyCashReportById,
  updateDailyCashReport,
  deleteDailyCashReport,
};