const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getPainterRewardTransactionHistory,
} = require("../../controllers/painter/painterRewardTransactionHistoryController");

// GET /api/painter/reward-transaction-history
router.get(
  "/",
  authMiddleware,
  getPainterRewardTransactionHistory
);

module.exports = router;