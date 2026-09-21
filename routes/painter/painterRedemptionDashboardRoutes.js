const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getPainterRedemptionDashboard,
} = require("../../controllers/painter/painterRedemptionDashboardController");

// GET /api/painter/redemption-dashboard
router.get(
  "/",
  authMiddleware,
  getPainterRedemptionDashboard
);

module.exports = router;