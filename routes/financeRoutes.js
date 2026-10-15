const express = require("express");

const router = express.Router();

const {
  createIncome,
  createExpense,
  getFinanceTransactions,
  getFinanceDashboard,
  updateFinanceTransaction,
  deleteFinanceTransaction,
} = require("../controllers/financeController");

// Finance Dashboard
router.get("/dashboard", getFinanceDashboard);

// Transactions
router.get("/transactions", getFinanceTransactions);

// Income
router.post("/income", createIncome);

// Expense
router.post("/expense", createExpense);

// Update Transaction
router.put("/transactions/:id", updateFinanceTransaction);

// Delete Transaction
router.delete("/transactions/:id", deleteFinanceTransaction);

module.exports = router;