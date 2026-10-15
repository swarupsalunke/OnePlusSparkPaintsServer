const express = require("express");

const {
  getRewardDashboard,
  getRewardWallet,
  addPoints,
  deductPoints,
  addCash,
  deductCash,
  getRewardTransactions,
  updateRewardTransaction,
  deleteRewardTransaction,
} = require("../controllers/rewardController");

const router = express.Router();

// Reward Dashboard
router.get("/dashboard", getRewardDashboard);

// Reward Wallet
router.get("/wallet/:userId", getRewardWallet);

// Reward Points
router.post("/points/add", addPoints);
router.post("/points/deduct", deductPoints);

// Cash Rewards
router.post("/cash/add", addCash);
router.post("/cash/deduct", deductCash);

// Reward Transactions / Ledger
router.get("/transactions", getRewardTransactions);

router.put("/transactions/:id", updateRewardTransaction);

router.delete("/transactions/:id", deleteRewardTransaction);

module.exports = router;