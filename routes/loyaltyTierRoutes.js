const express = require("express");

const {
  createLoyaltyTier,
  getAllLoyaltyTiers,
  getLoyaltyTierById,
  updateLoyaltyTier,
  updateLoyaltyTierStatus,
  deleteLoyaltyTier,
  getLoyaltyTierStats,
} = require("../controllers/loyaltyTierController");

const router = express.Router();

// =====================================================
// DASHBOARD STATISTICS
// =====================================================

router.get("/stats", getLoyaltyTierStats);

// =====================================================
// CREATE LOYALTY TIER
// =====================================================

router.post("/", createLoyaltyTier);

// =====================================================
// GET ALL LOYALTY TIERS
// =====================================================

router.get("/", getAllLoyaltyTiers);

// =====================================================
// GET SINGLE LOYALTY TIER
// =====================================================

router.get("/:id", getLoyaltyTierById);

// =====================================================
// UPDATE LOYALTY TIER
// =====================================================

router.put("/:id", updateLoyaltyTier);

// =====================================================
// UPDATE TIER STATUS
// =====================================================

router.patch("/:id/status", updateLoyaltyTierStatus);

// =====================================================
// DELETE LOYALTY TIER
// =====================================================

router.delete("/:id", deleteLoyaltyTier);

module.exports = router;