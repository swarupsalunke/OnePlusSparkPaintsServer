const LoyaltyTier = require("../../models/painter/LoyaltyTier");

// ==========================================
// GET PAINTER TIER BENEFITS
// GET /api/painter/tier-benefits
// ==========================================

const getPainterTierBenefits = async (req, res) => {
  try {
    const tiers = await LoyaltyTier.find({
      applicableTo: "PAINTER",
      status: "ACTIVE",
    })
      .sort({ level: 1 })
      .lean();

    const benefitKeys = [
      "higherRewardPoints",
      "exclusiveSchemes",
      "cashbackOffers",
      "earlyProductLaunchAccess",
      "premiumSupport",
    ];

    const benefits = benefitKeys.map((benefitKey) => {
      const availableTier = tiers.find(
        (tier) => tier.benefits?.[benefitKey] === true
      );

      return {
        benefit: benefitKey,
        available: Boolean(availableTier),
        availableFromTier: availableTier?.tierName || "-",
      };
    });

    return res.status(200).json({
      success: true,
      benefits,
    });
  } catch (error) {
    console.error(
      "Get Painter Tier Benefits Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tier benefits",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterTierBenefits,
};