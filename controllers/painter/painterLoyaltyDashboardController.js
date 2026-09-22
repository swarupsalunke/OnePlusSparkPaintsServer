const RewardWallet = require("../../models/superadmin/RewardWallet");
const LoyaltyTier = require("../../models/painter/LoyaltyTier");

// ==========================================
// GET PAINTER LOYALTY DASHBOARD
// GET /api/painter/loyalty-dashboard
// ==========================================

const getPainterLoyaltyDashboard = async (req, res) => {
  try {
    const painterId =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const wallet = await RewardWallet.findOne({
      user: painterId,
      userType: "PAINTER",
    }).lean();

    const currentPoints = wallet?.currentPoints || 0;

    const tiers = await LoyaltyTier.find({
      applicableTo: "PAINTER",
      status: "ACTIVE",
    })
      .sort({ level: 1 })
      .lean();

    if (!tiers.length) {
      return res.status(200).json({
        success: true,
        loyalty: {
          currentTier: "-",
          currentPoints,
          nextTier: "-",
          nextTierTarget: 0,
          achievementPercentage: 0,
          tierProgress: 0,
        },
        tiers: [],
      });
    }

    // Current tier based on highest level
    // whose minimum purchase requirement is satisfied.
    let currentTier = tiers[0];

    for (const tier of tiers) {
      if (currentPoints >= tier.minPurchase) {
        currentTier = tier;
      }
    }

    const currentIndex = tiers.findIndex(
      (tier) => tier._id.toString() === currentTier._id.toString()
    );

    const nextTier =
      currentIndex >= 0 && currentIndex < tiers.length - 1
        ? tiers[currentIndex + 1]
        : null;

    let achievementPercentage = 100;
    let tierProgress = 100;
    let nextTierTarget = 0;

    if (nextTier) {
      nextTierTarget = nextTier.minPurchase;

      const currentTierTarget = currentTier.minPurchase;

      const range =
        nextTierTarget - currentTierTarget;

      const achieved =
        currentPoints - currentTierTarget;

      achievementPercentage =
        range > 0
          ? Math.round((achieved / range) * 100)
          : 0;

      achievementPercentage = Math.max(
        0,
        Math.min(100, achievementPercentage)
      );

      tierProgress = achievementPercentage;
    }

    return res.status(200).json({
      success: true,

      loyalty: {
        currentTier: currentTier?.tierName || "-",
        currentPoints,
        nextTier: nextTier?.tierName || "-",
        nextTierTarget,
        achievementPercentage,
        tierProgress,
      },

      tiers: tiers.map((tier) => ({
        id: tier._id,
        tierName: tier.tierName,
        level: tier.level,
        tierType: tier.tierType,
        applicableTo: tier.applicableTo,
        minPurchase: tier.minPurchase,
        rewardPointsMultiplier: tier.rewardPointsMultiplier,
        cashbackPercentage: tier.cashbackPercentage,
        benefits: tier.benefits,
        qualificationRules: tier.qualificationRules,
        status: tier.status,
        description: tier.description,
      })),
    });
  } catch (error) {
    console.error(
      "Get Painter Loyalty Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch loyalty dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterLoyaltyDashboard,
};