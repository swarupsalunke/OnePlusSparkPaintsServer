const DailyCashReport = require("../../models/superadmin/DailyCashReport");

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const sum = (items, callback) => {
  return (items || []).reduce(
    (total, item) => total + callback(item),
    0
  );
};

const isCash = (mode) => {
  return !mode || String(mode).toUpperCase() === "CASH";
};

const getDigitalTotal = (collections = {}) => {
  return (
    toNumber(collections.upi) +
    toNumber(collections.card) +
    toNumber(collections.netBanking) +
    toNumber(collections.other)
  );
};

// ==========================================
// PURCHASE PAYMENT CALCULATION
// ==========================================

const getPurchasePaidAmount = (item) => {
  const paymentStatus = String(
    item.paymentStatus || "CREDIT"
  ).toUpperCase();

  if (paymentStatus === "CASH_PAID") {
    return item.paidAmount !== undefined &&
      item.paidAmount !== null
      ? toNumber(item.paidAmount)
      : toNumber(item.amount);
  }

  if (paymentStatus === "PARTIAL") {
    return toNumber(item.paidAmount);
  }

  return 0;
};

// ==========================================
// CALCULATE REPORT TOTALS
// ==========================================

const calculateReportTotals = (data) => {
  const collections = data.collections || {};
  const receipts = data.receipts || [];

  // RECEIPTS

  const totalCashReceipts = receipts.length
    ? sum(
      receipts.filter((item) => isCash(item.paymentMode)),
      (item) => toNumber(item.amount)
    )
    : toNumber(collections.cash);

  const totalDigitalReceipts = receipts.length
    ? sum(
      receipts.filter((item) => !isCash(item.paymentMode)),
      (item) => toNumber(item.amount)
    )
    : getDigitalTotal(collections);

  const totalReceipt = receipts.length
    ? sum(receipts, (item) => toNumber(item.amount))
    : totalCashReceipts + totalDigitalReceipts;

  // EXPENSES

  const expenses = data.expenses || [];

  const totalExpenses = sum(
    expenses,
    (item) => toNumber(item.amount)
  );

  const totalCashExpenses = sum(
    expenses.filter((item) => isCash(item.paymentMode)),
    (item) => toNumber(item.amount)
  );

  const totalDigitalExpenses =
    totalExpenses - totalCashExpenses;

  // ADVANCE SALARY

  const advanceSalary = data.advanceSalary || [];

  const totalAdvanceSalary = sum(
    advanceSalary,
    (item) => toNumber(item.amount)
  );

  const totalCashAdvanceSalary = sum(
    advanceSalary.filter((item) => isCash(item.paymentMode)),
    (item) => toNumber(item.amount)
  );

  const totalDigitalAdvanceSalary =
    totalAdvanceSalary - totalCashAdvanceSalary;

  // PURCHASE BILLS

  const purchaseBills = data.purchaseBills || [];

  const totalPurchaseAmount = sum(
    purchaseBills,
    (item) => toNumber(item.amount)
  );

  const totalCashPurchasePaid = sum(
    purchaseBills,
    (item) => {
      if (
        String(item.paymentStatus || "CREDIT").toUpperCase() ===
        "CASH_PAID"
      ) {
        return isCash(item.paymentMode)
          ? getPurchasePaidAmount(item)
          : 0;
      }

      if (
        String(item.paymentStatus || "").toUpperCase() ===
        "PARTIAL"
      ) {
        return isCash(item.paymentMode)
          ? getPurchasePaidAmount(item)
          : 0;
      }

      return 0;
    }
  );

  const totalDigitalPurchasePaid = sum(
    purchaseBills,
    (item) => {
      const paymentStatus = String(
        item.paymentStatus || "CREDIT"
      ).toUpperCase();

      if (
        paymentStatus === "CASH_PAID" ||
        paymentStatus === "PARTIAL"
      ) {
        return !isCash(item.paymentMode)
          ? getPurchasePaidAmount(item)
          : 0;
      }

      return 0;
    }
  );

  // CASH TRANSFERS

  const cashTransfersIn = data.cashTransfersIn || [];
  const cashTransfersOut = data.cashTransfersOut || [];

  const totalCashTransfersIn = sum(
    cashTransfersIn,
    (item) => toNumber(item.amount)
  );

  let totalCashTransfersOut = sum(
    cashTransfersOut,
    (item) => toNumber(item.amount)
  );

  // OLD OFFICE TRANSFER SUPPORT
  // Avoid double counting when cashTransfersOut is available.

  if (
    cashTransfersOut.length === 0 &&
    data.officeTransfer &&
    isCash(data.officeTransfer.transferMode)
  ) {
    totalCashTransfersOut = toNumber(
      data.officeTransfer.transferAmount
    );
  }

  // SALES RETURNS

  const salesReturns = data.salesReturns || [];

  const totalSalesReturn = sum(
    salesReturns,
    (item) => toNumber(item.amount)
  );

  const totalCashSalesReturn = sum(
    salesReturns.filter((item) => isCash(item.refundMode)),
    (item) => toNumber(item.amount)
  );

  const totalDigitalSalesReturn =
    totalSalesReturn - totalCashSalesReturn;

  // EXPECTED CASH CLOSING

  const openingCashBalance = toNumber(
    data.openingCashBalance
  );

  const closingBalance =
    openingCashBalance +
    totalCashReceipts +
    totalCashTransfersIn -
    totalCashExpenses -
    totalCashAdvanceSalary -
    totalCashPurchasePaid -
    totalCashTransfersOut -
    totalCashSalesReturn;

  // DIGITAL SETTLEMENT

  const totalDigitalPayments =
    totalDigitalExpenses +
    totalDigitalAdvanceSalary +
    totalDigitalPurchasePaid +
    totalDigitalSalesReturn;

  const netDigitalBalance =
    totalDigitalReceipts - totalDigitalPayments;

  return {
    totalReceipt,
    totalCashReceipts,
    totalDigitalReceipts,

    totalExpenses,
    totalCashExpenses,
    totalDigitalExpenses,

    totalAdvanceSalary,
    totalCashAdvanceSalary,

    totalDigitalAdvanceSalary,

    totalPurchaseAmount,
    totalCashPurchasePaid,

    totalDigitalPurchasePaid,

    totalCashTransfersIn,
    totalCashTransfersOut,

    totalSalesReturn,
    totalCashSalesReturn,

    totalDigitalSalesReturn,

    closingBalance,

    digitalSettlement: {
      totalDigitalReceipts,
      totalDigitalPayments,
      netDigitalBalance,
    },
  };
};

// ==========================================
// GET PREVIOUS APPROVED CLOSING BALANCE
// ==========================================

const getPreviousApprovedClosing = async ({
  reportDate,
  reportTime,
  branch,
  storeName,
}) => {
  const previousReport = await DailyCashReport.findOne({
    branch,
    storeName,
    status: "APPROVED",
    $or: [
      {
        openingBalanceStatus: {
          $in: ["APPROVED", "NOT_REQUIRED"],
        },
      },
      {
        openingBalanceStatus: { $exists: false },
      },
    ],
    $and: [
      {
        $or: [
          { reportDate: { $lt: reportDate } },
          {
            reportDate,
            reportTime: { $lt: reportTime },
          },
        ],
      },
    ],
  }).sort({
    reportDate: -1,
    reportTime: -1,
    createdAt: -1,
  });

  return previousReport;
};

// ==========================================
// CREATE DAILY CASH REPORT
// ==========================================

const createDailyCashReport = async (req, res) => {
  try {
    const {
      reportDate,
      reportTime,
      shift,
      branch,
      storeName,
      cashierName,
      openingCashBalance,
    } = req.body;

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

    let finalOpeningCash = toNumber(openingCashBalance);
    let finalOpeningBalanceSource = "MANUAL";
    let openingBalanceStatus = "PENDING";

    const previousReport = await getPreviousApprovedClosing({
      reportDate,
      reportTime,
      branch,
      storeName,
    });

    if (previousReport) {
      finalOpeningCash = toNumber(previousReport.closingBalance);
      finalOpeningBalanceSource = "PREVIOUS_CLOSING";
      openingBalanceStatus = "NOT_REQUIRED";
    }

    const reportData = {
      ...req.body,
      openingCashBalance: finalOpeningCash,
      openingBalanceSource: finalOpeningBalanceSource,
      openingBalanceStatus,
    };

    // Client cannot control approval fields
    delete reportData.openingOnlineBalance;
    delete reportData.openingBalanceApprovedBy;
    delete reportData.openingBalanceApprovedAt;
    delete reportData.openingBalanceRejectedBy;
    delete reportData.openingBalanceRejectedAt;
    delete reportData.openingBalanceRejectionReason;
    delete reportData.approvedBy;
    delete reportData.approvedAt;
    delete reportData.rejectedBy;
    delete reportData.rejectedAt;
    delete reportData.rejectionReason;

    const calculatedTotals = calculateReportTotals(reportData);

    const report = await DailyCashReport.create({
      ...reportData,
      ...calculatedTotals,
      status:
        req.body.status === "DRAFT"
          ? "DRAFT"
          : "SUBMITTED",
    });

    return res.status(201).json({
      success: true,
      message: "Daily cash report created successfully",
      report,
    });
  } catch (error) {
    console.error("Create daily cash report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create daily cash report",
      error: error.message,
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
      reportDate,
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

    if (reportDate) {
      filter.reportDate = reportDate;
    }

    if (search) {
      const searchRegex = {
        $regex: search,
        $options: "i",
      };

      filter.$or = [
        { storeName: searchRegex },
        { cashierName: searchRegex },
        { branch: searchRegex },
      ];
    }

    const reports = await DailyCashReport.find(filter).sort({
      reportDate: -1,
      reportTime: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get daily cash reports error:", error);

    return res.status(500).json({
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

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get daily cash report error:", error);

    return res.status(500).json({
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

    const existingReport = await DailyCashReport.findById(id);

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: "Daily cash report not found",
      });
    }

    // APPROVAL MUST USE SEPARATE API

    if (req.body.status === "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Report approval must use the approval workflow",
      });
    }

    if (existingReport.status === "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Approved reports cannot be modified",
      });
    }

    const updateData = {
      ...req.body,
    };

    // PROTECT APPROVAL FIELDS

    const protectedFields = [
      "status",
      "openingBalanceStatus",
      "openingBalanceSource",
      "openingBalanceApprovedBy",
      "openingBalanceApprovedAt",
      "openingBalanceRejectedBy",
      "openingBalanceRejectedAt",
      "openingBalanceRejectionReason",
      "approvedBy",
      "approvedAt",
      "rejectedBy",
      "rejectedAt",
      "rejectionReason",
    ];

    protectedFields.forEach((field) => {
      delete updateData[field];
    });

    // OPENING BALANCE RULES

    if (
      existingReport.openingBalanceSource === "PREVIOUS_CLOSING"
    ) {
      updateData.openingCashBalance =
        existingReport.openingCashBalance;

      updateData.openingBalanceSource = "PREVIOUS_CLOSING";
    } else {
      // Manual opening cash cannot be changed after approval/rejection
      if (
        ["APPROVED", "REJECTED"].includes(
          existingReport.openingBalanceStatus
        )
      ) {
        updateData.openingCashBalance =
          existingReport.openingCashBalance;
      }
    }

    delete updateData.openingOnlineBalance;

    // MERGE DATA FOR RECALCULATION

    const mergedData = {
      ...existingReport.toObject(),
      ...updateData,
    };

    const calculatedTotals = calculateReportTotals(mergedData);

    const report = await DailyCashReport.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateData,
          ...calculatedTotals,
        },
        $unset: {
          openingOnlineBalance: 1,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Daily cash report updated successfully",
      report,
    });
  } catch (error) {
    console.error("Update daily cash report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update daily cash report",
      error: error.message,
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

    return res.status(200).json({
      success: true,
      message: "Daily cash report deleted successfully",
    });
  } catch (error) {
    console.error("Delete daily cash report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete daily cash report",
    });
  }
};

// ==========================================
// APPROVE OPENING CASH BALANCE
// ==========================================

const approveOpeningBalance = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await DailyCashReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Daily cash report not found",
      });
    }

    if (report.openingBalanceSource !== "MANUAL") {
      return res.status(400).json({
        success: false,
        message: "Only manual opening cash requires approval",
      });
    }

    if (report.openingBalanceStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Opening cash is not pending approval",
      });
    }

    report.openingBalanceStatus = "APPROVED";
    report.openingBalanceApprovedBy = req.user.userId;
    report.openingBalanceApprovedAt = new Date();

    report.openingBalanceRejectedBy = null;
    report.openingBalanceRejectedAt = null;
    report.openingBalanceRejectionReason = "";

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Opening cash balance approved successfully",
      report,
    });
  } catch (error) {
    console.error("Approve opening balance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve opening cash balance",
      error: error.message,
    });
  }
};


// ==========================================
// REJECT OPENING CASH BALANCE
// ==========================================

const rejectOpeningBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const report = await DailyCashReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Daily cash report not found",
      });
    }

    if (report.openingBalanceSource !== "MANUAL") {
      return res.status(400).json({
        success: false,
        message: "Only manual opening cash can be rejected",
      });
    }

    if (report.openingBalanceStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Opening cash is not pending approval",
      });
    }

    report.openingBalanceStatus = "REJECTED";
    report.openingBalanceRejectedBy = req.user.userId;
    report.openingBalanceRejectedAt = new Date();
    report.openingBalanceRejectionReason = rejectionReason.trim();

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Opening cash balance rejected successfully",
      report,
    });
  } catch (error) {
    console.error("Reject opening balance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject opening cash balance",
      error: error.message,
    });
  }
};


// ==========================================
// APPROVE DAILY CASH REPORT
// ==========================================

const approveDailyCashReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await DailyCashReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Daily cash report not found",
      });
    }

    if (
      !["APPROVED", "NOT_REQUIRED"].includes(
        report.openingBalanceStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Opening cash balance must be approved first",
      });
    }

    if (report.status !== "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Only submitted reports can be approved",
      });
    }

    report.status = "APPROVED";
    report.approvedBy = req.user.userId;
    report.approvedAt = new Date();

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Daily cash report approved successfully",
      report,
    });
  } catch (error) {
    console.error("Approve daily cash report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve daily cash report",
    });
  }
};

// ==========================================
// REJECT DAILY CASH REPORT
// ==========================================

const rejectDailyCashReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const report = await DailyCashReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Daily cash report not found",
      });
    }

    if (report.status !== "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Only submitted reports can be rejected",
      });
    }

    report.status = "REJECTED";
    report.rejectedBy = req.user.userId;
    report.rejectedAt = new Date();
    report.rejectionReason = rejectionReason.trim();

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Daily cash report rejected successfully",
      report,
    });
  } catch (error) {
    console.error("Reject daily cash report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject daily cash report",
    });
  }
};
// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  createDailyCashReport,
  getDailyCashReports,
  getDailyCashReportById,
  updateDailyCashReport,
  deleteDailyCashReport,
  approveDailyCashReport,
  rejectDailyCashReport,
  approveOpeningBalance,
  rejectOpeningBalance,
};