const express = require("express");

const {
  createLoyaltyTier,
  getAllLoyaltyTiers,
  getLoyaltyTierById,
  updateLoyaltyTier,
  updateLoyaltyTierStatus,
  deleteLoyaltyTier,
  getLoyaltyTierStats,
  createLoyaltyTierType,
  getAllLoyaltyTierTypes,
} = require("../../controllers/superadmin/loyaltyTierController");

const router = express.Router();

// =====================================================
// DASHBOARD STATISTICS
// =====================================================

router.get("/stats", getLoyaltyTierStats);

// =====================================================
// TIER TYPE ROUTES
// =====================================================

router.post("/types", createLoyaltyTierType);
router.get("/types", getAllLoyaltyTierTypes);

// =====================================================
// LOYALTY TIER ROUTES
// =====================================================

router.post("/", createLoyaltyTier);
router.get("/", getAllLoyaltyTiers);
router.get("/:id", getLoyaltyTierById);
router.put("/:id", updateLoyaltyTier);
router.patch("/:id/status", updateLoyaltyTierStatus);
router.delete("/:id", deleteLoyaltyTier);

module.exports = router;