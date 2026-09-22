const express = require("express");

const {
  getPainterTierProgress,
} = require("../../controllers/painter/painterTierProgressController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// PAINTER TIER PROGRESS
// GET /api/painter/tier-progress
// ==========================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterTierProgress
);

module.exports = router;