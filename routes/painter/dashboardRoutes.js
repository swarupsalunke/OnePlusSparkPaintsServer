const express = require("express");

const {
  getPainterDashboard,
} = require("../../controllers/painter/dashboardController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// PAINTER DASHBOARD
// GET /api/painter/dashboard
// ==========================================

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterDashboard
);

module.exports = router;