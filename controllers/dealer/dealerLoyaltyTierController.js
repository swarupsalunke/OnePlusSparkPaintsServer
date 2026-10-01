const DealerOrder = require("../../models/dealer/DealerOrder");
const LoyaltyTier = require("../../models/superadmin/loyaltyTierModel");

// GET DEALER LOYALTY TIER
const getDealerLoyaltyTier = async (req, res) => {
  try {
    const dealerId = req.user.userId;

    const orders = await DealerOrder.find({
      dealer: dealerId,
      status: { $ne: "Cancelled" },
    }).select("totalAmount");

    const currentPurchase = orders.reduce(
      (total, order) => total + Number(order.totalAmount || 0),
      0
    );

    const tiers = await LoyaltyTier.find({
      applicableTo: "DEALER",
      status: "ACTIVE",
    }).sort({ level: 1 });

    if (tiers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active loyalty tiers found",
      });
    }

    let currentTier = null;

    for (const tier of tiers) {
      if (currentPurchase >= Number(tier.minPurchase || 0)) {
        currentTier = tier;
      }
    }

    if (!currentTier) {
      currentTier = tiers[0];
    }

    const nextTier = tiers.find(
      (tier) => Number(tier.level) > Number(currentTier.level)
    );

    let progressPercentage = 0;

    if (nextTier) {
      const currentTarget = Number(currentTier.minPurchase || 0);
      const nextTarget = Number(nextTier.minPurchase || 0);

      if (nextTarget > currentTarget) {
        progressPercentage =
          ((currentPurchase - currentTarget) /
            (nextTarget - currentTarget)) *
          100;
      }
    } else {
      progressPercentage = 100;
    }

    progressPercentage = Math.min(
      100,
      Math.max(0, Number(progressPercentage.toFixed(2)))
    );

    const achievementPercentage = Math.min(
      100,
      Math.max(
        0,
        Number(
          (
            (currentPurchase / Number(currentTier.minPurchase || 1)) *
            100
          ).toFixed(2)
        )
      )
    );

    res.status(200).json({
      success: true,
      data: {
        currentPurchase,
        currentTier,
        nextTier,
        progressPercentage,
        achievementPercentage,
      },
    });
  } catch (error) {
    console.error("Get dealer loyalty tier error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dealer loyalty tier",
      error: error.message,
    });
  }
};

module.exports = {
  getDealerLoyaltyTier,
};