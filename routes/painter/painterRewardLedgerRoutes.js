const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getPainterRewardLedger,
} = require("../../controllers/painter/painterRewardLedgerController");

// GET /api/painter/reward-ledger
router.get(
  "/",
  authMiddleware,
  getPainterRewardLedger
);

module.exports = router;