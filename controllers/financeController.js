const FinanceTransaction = require("../models/financeTransactionModel");

// Generate Transaction ID
const generateTransactionId = async (prefix) => {
  const count = await FinanceTransaction.countDocuments();

  const number = String(count + 1).padStart(4, "0");

  return `${prefix}-${new Date().getFullYear()}-${number}`;
};


// ===============================
// CREATE INCOME
// ===============================
const createIncome = async (req, res) => {
  try {
    const {
      date,
      description,
      category,
      account,
      amount,
      paymentMode,
      invoice,
      vendor,
      assignedTo,
    } = req.body;

    if (!description || !category || !account || !amount) {
      return res.status(400).json({
        success: false,
        message: "Description, category, account and amount are required",
      });
    }

    const transactionId = await generateTransactionId("INC");

    const transaction = await FinanceTransaction.create({
      transactionId,
      type: "PAYMENT_RECEIVED",
      date: date || new Date(),
      description,
      category,
      account,
      amount,
      paymentMode: paymentMode || "NA",
      status: "RECEIVED",
      invoice: invoice || "",
      vendor: vendor || "",
      assignedTo: assignedTo || null,
    });

    res.status(201).json({
      success: true,
      message: "Income added successfully",
      transaction,
    });
  } catch (error) {
    console.error("Create income error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add income",
      error: error.message,
    });
  }
};


// ===============================
// CREATE EXPENSE
// ===============================
const createExpense = async (req, res) => {
  try {
    const {
      date,
      description,
      category,
      account,
      amount,
      paymentMode,
      vendor,
      assignedTo,
    } = req.body;

    if (!description || !category || !account || !amount) {
      return res.status(400).json({
        success: false,
        message: "Description, category, account and amount are required",
      });
    }

    const transactionId = await generateTransactionId("EXP");

    const transaction = await FinanceTransaction.create({
      transactionId,
      type: "PENDING_PAYMENT",
      date: date || new Date(),
      description,
      category,
      account,
      amount,
      paymentMode: paymentMode || "NA",
      status: "PENDING",
      vendor: vendor || "",
      assignedTo: assignedTo || null,
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      transaction,
    });
  } catch (error) {
    console.error("Create expense error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add expense",
      error: error.message,
    });
  }
};


// ===============================
// GET ALL TRANSACTIONS
// ===============================
const getFinanceTransactions = async (req, res) => {
  try {
    const transactions = await FinanceTransaction.find()
      .populate("assignedTo", "name email")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch finance transactions",
      error: error.message,
    });
  }
};


// ===============================
// FINANCE DASHBOARD
// ===============================
const getFinanceDashboard = async (req, res) => {
  try {
    const transactions = await FinanceTransaction.find();

    // Income
    const totalIncome = transactions
      .filter((item) => item.type === "PAYMENT_RECEIVED")
      .reduce((sum, item) => sum + item.amount, 0);

    // Expenses
    const totalExpenses = transactions
      .filter((item) => item.type === "PENDING_PAYMENT")
      .reduce((sum, item) => sum + item.amount, 0);

    // Net Profit
    const netProfit = totalIncome - totalExpenses;

    // Invoice count
    const totalInvoices = transactions.filter(
      (item) => item.type === "INVOICE"
    ).length;

    // Payment received
    const paymentReceived = transactions.filter(
      (item) => item.type === "PAYMENT_RECEIVED"
    ).length;

    // Outstanding
    const outstandingTransactions = transactions.filter(
      (item) => item.type === "OUTSTANDING"
    );

    const outstandingReceivables = outstandingTransactions.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    // Pending payments
    const pendingTransactions = transactions.filter(
      (item) => item.type === "PENDING_PAYMENT"
    );

    const outstandingPayables = pendingTransactions.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    // Pending payment count
    const pendingPayment = pendingTransactions.length;

    // Credit balance
    const creditTransactions = transactions.filter(
      (item) => item.type === "CREDIT_BALANCE"
    );

    const creditBalance = creditTransactions.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    // Follow-up
    const followUps = transactions.filter(
      (item) => item.type === "FOLLOW_UP"
    );

    // Cash in hand
    const cashInHand = totalIncome - totalExpenses;

    res.status(200).json({
      success: true,

      dashboard: {
        totalIncome,
        totalExpenses,
        netProfit,

        outstandingReceivables,
        outstandingPayables,

        cashInHand,

        totalInvoices,
        paymentReceived,

        outstandingCount: outstandingTransactions.length,
        pendingPayment,

        creditBalance,

        followUpCount: followUps.length,
      },
    });
  } catch (error) {
    console.error("Finance dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch finance dashboard",
      error: error.message,
    });
  }
};

// Update Finance Transaction
const updateFinanceTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTransaction =
      await FinanceTransaction.findByIdAndUpdate(
        id,
        {
          transactionId: req.body.transactionId,
          type: req.body.type,
          date: req.body.date,
          description: req.body.description,
          category: req.body.category,
          account: req.body.account,
          amount: req.body.amount,
          paymentMode: req.body.paymentMode,
          status: req.body.status,
          invoice: req.body.invoice,
          vendor: req.body.vendor,
          assignedTo: req.body.assignedTo || null,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedTransaction) {
      return res.status(404).json({
        success: false,
        message: "Finance transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Finance transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("Update Finance Transaction Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Finance Transaction
const deleteFinanceTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTransaction =
      await FinanceTransaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res.status(404).json({
        success: false,
        message: "Finance transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Finance transaction deleted successfully",
      data: deletedTransaction,
    });
  } catch (error) {
    console.error("Delete Finance Transaction Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createIncome,
  createExpense,
  getFinanceTransactions,
  getFinanceDashboard,
  updateFinanceTransaction,
  deleteFinanceTransaction,
};