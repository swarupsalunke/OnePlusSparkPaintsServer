const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getPainterRewardAnalytics,
} = require("../../controllers/painter/painterRewardAnalyticsController");

// GET /api/painter/reward-analytics
router.get(
  "/",
  authMiddleware,
  getPainterRewardAnalytics
);

module.exports = router;