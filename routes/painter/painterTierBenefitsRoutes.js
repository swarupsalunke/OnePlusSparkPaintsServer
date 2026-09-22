const express = require("express");

const {
  getPainterTierBenefits,
} = require("../../controllers/painter/painterTierBenefitsController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// PAINTER TIER BENEFITS
// GET /api/painter/tier-benefits
// ==========================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterTierBenefits
);

module.exports = router;