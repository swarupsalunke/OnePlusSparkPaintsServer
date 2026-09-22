const express = require("express");

const {
  getPainterLoyaltyDashboard,
} = require("../../controllers/painter/painterLoyaltyDashboardController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// PAINTER LOYALTY DASHBOARD
// GET /api/painter/loyalty-dashboard
// ==========================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterLoyaltyDashboard
);

module.exports = router;