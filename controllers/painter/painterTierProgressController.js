const RewardWallet = require("../../models/superadmin/RewardWallet");
const LoyaltyTier = require("../../models/painter/LoyaltyTier");

// ==========================================
// GET PAINTER TIER PROGRESS
// GET /api/painter/tier-progress
// ==========================================

const getPainterTierProgress = async (req, res) => {
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

    // Get painter reward wallet
    const wallet = await RewardWallet.findOne({
      user: painterId,
      userType: "PAINTER",
    }).lean();

    const currentPoints = wallet?.currentPoints || 0;

    // Get active tiers applicable to painters
    const tiers = await LoyaltyTier.find({
      applicableTo: "PAINTER",
      status: "ACTIVE",
    })
      .sort({ level: 1 })
      .lean();

    if (!tiers.length) {
      return res.status(200).json({
        success: true,
        progress: {
          currentTier: "-",
          currentPoints,
          nextTier: "-",
          nextTierTarget: 0,
          achievementPercentage: 0,
          pointsNeeded: 0,
        },
        milestones: [],
      });
    }

    // Determine current tier
    let currentTier = tiers[0];

    for (const tier of tiers) {
      if (currentPoints >= tier.minPurchase) {
        currentTier = tier;
      }
    }

    const currentIndex = tiers.findIndex(
      (tier) =>
        tier._id.toString() === currentTier._id.toString()
    );

    // Determine next tier
    const nextTier =
      currentIndex >= 0 &&
      currentIndex < tiers.length - 1
        ? tiers[currentIndex + 1]
        : null;

    let achievementPercentage = 100;
    let pointsNeeded = 0;
    let nextTierTarget = 0;

    if (nextTier) {
      nextTierTarget = nextTier.minPurchase;

      pointsNeeded = Math.max(
        0,
        nextTierTarget - currentPoints
      );

      const currentTarget = currentTier.minPurchase;

      const range =
        nextTierTarget - currentTarget;

      const achieved =
        currentPoints - currentTarget;

      achievementPercentage =
        range > 0
          ? Math.round((achieved / range) * 100)
          : 0;

      achievementPercentage = Math.max(
        0,
        Math.min(100, achievementPercentage)
      );
    }

    // Calculate milestone progress
    const milestones = tiers.map((tier) => {
      let percentage = 0;

      if (currentPoints >= tier.minPurchase) {
        percentage = 100;
      }

      return {
        tier: tier.tierName,
        level: tier.level,
        percentage,
      };
    });

    return res.status(200).json({
      success: true,

      progress: {
        currentTier:
          currentTier?.tierName || "-",

        currentPoints,

        nextTier:
          nextTier?.tierName || "-",

        nextTierTarget,

        achievementPercentage,

        pointsNeeded,
      },

      milestones,
    });
  } catch (error) {
    console.error(
      "Get Painter Tier Progress Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tier progress",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterTierProgress,
};