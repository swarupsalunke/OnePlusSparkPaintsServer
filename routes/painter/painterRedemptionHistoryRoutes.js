const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getPainterRedemptionHistory,
} = require("../../controllers/painter/painterRedemptionHistoryController");

// GET /api/painter/redemption-history
router.get(
  "/",
  authMiddleware,
  getPainterRedemptionHistory
);

module.exports = router;