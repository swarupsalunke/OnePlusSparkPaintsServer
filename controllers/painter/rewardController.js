const RewardWallet = require("../../models/superadmin/RewardWallet");
const RewardTransaction = require("../../models/superadmin/RewardTransaction");

// Get Quick Rewards for logged-in Painter
const getPainterRewards = async (req, res) => {
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

    // Get painter wallet
    const wallet = await RewardWallet.findOne({
      user: painterId,
    });

    // Get painter's recent reward transactions
    const transactions = await RewardTransaction.find({
      user: painterId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,

      summary: {
        availablePoints: wallet?.currentPoints || 0,
        cashRewards: wallet?.currentCashBalance || 0,
        pendingRewards: wallet?.pendingRewards || 0,
      },

      recentRewards: transactions,
    });
  } catch (error) {
    console.error("Get painter rewards error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch painter rewards",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterRewards,
};