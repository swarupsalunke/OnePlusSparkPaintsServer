const BankPayment = require("../models/bankPayment");
const XLSX = require("xlsx");

// Get Bank Payment Dashboard
const getBankPaymentDashboard = async (req, res) => {
  try {
    const payments = await BankPayment.find();

    const totalBeneficiaries = payments.length;

    const totalAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const totalTransactions = payments.length;

    res.status(200).json({
      success: true,
      dashboard: {
        totalBeneficiaries,
        totalAmount,
        totalTransactions,
      },
    });
  } catch (error) {
    console.error("Get bank payment dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bank payment dashboard",
      error: error.message,
    });
  }
};

// Get All Beneficiaries
const getBeneficiaries = async (req, res) => {
  try {
    const payments = await BankPayment.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get beneficiaries error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch beneficiaries",
      error: error.message,
    });
  }
};

// Get Beneficiary By ID
const getBeneficiaryById = async (req, res) => {
  try {
    const payment = await BankPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get beneficiary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch beneficiary",
      error: error.message,
    });
  }
};

// Create Beneficiary
const createBeneficiary = async (req, res) => {
  try {
    const {
      beneficiaryName,
      bankName,
      accountNumber,
      ifscCode,
      amount,
      remarks,
      paymentDate,
      bankAccount,
      paymentType,
    } = req.body;

    if (
      !beneficiaryName ||
      !bankName ||
      !accountNumber ||
      !ifscCode ||
      amount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const payment = await BankPayment.create({
      beneficiaryName,
      bankName,
      accountNumber,
      ifscCode,
      amount,
      remarks,
      paymentDate: paymentDate || new Date(),
      bankAccount,
      paymentType: paymentType || "Reward Payment",
    });

    res.status(201).json({
      success: true,
      message: "Beneficiary created successfully",
      payment,
    });
  } catch (error) {
    console.error("Create beneficiary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create beneficiary",
      error: error.message,
    });
  }
};

// Update Beneficiary
const updateBeneficiary = async (req, res) => {
  try {
    const payment = await BankPayment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Beneficiary updated successfully",
      payment,
    });
  } catch (error) {
    console.error("Update beneficiary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update beneficiary",
      error: error.message,
    });
  }
};

// Delete Beneficiary
const deleteBeneficiary = async (req, res) => {
  try {
    const payment = await BankPayment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Beneficiary deleted successfully",
    });
  } catch (error) {
    console.error("Delete beneficiary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete beneficiary",
      error: error.message,
    });
  }
};

// Generate Payment Sheet
const generatePaymentSheet = async (req, res) => {
  try {
    const {
      paymentDate,
      bankAccount,
      paymentType,
      remarks,
    } = req.body;

    if (!paymentDate) {
      return res.status(400).json({
        success: false,
        message: "Payment date is required",
      });
    }

    const payments = await BankPayment.find().sort({
      createdAt: -1,
    });

    if (payments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No beneficiaries found",
      });
    }

    const sheetData = payments.map((payment, index) => ({
      "Sr. No.": index + 1,
      "Beneficiary Name": payment.beneficiaryName,
      "Bank Name": payment.bankName,
      "Account Number": payment.accountNumber,
      "IFSC Code": payment.ifscCode,
      "Amount": payment.amount,
      "Remarks": payment.remarks || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(sheetData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Bank Payment Sheet"
    );

    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="bank-payment-sheet.xlsx"'
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.status(200).send(excelBuffer);
  } catch (error) {
    console.error(
      "Generate payment sheet error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to generate payment sheet",
      error: error.message,
    });
  }
};

module.exports = {
  getBankPaymentDashboard,
  getBeneficiaries,
  getBeneficiaryById,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  generatePaymentSheet,
};