const RewardWallet = require("../../models/superadmin/RewardWallet");
const RewardTransaction = require("../../models/superadmin/RewardTransaction");

// GET /api/painter/reward-wallet
const getPainterRewardWallet = async (req, res) => {
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
      userType: "PAINTER",
    }).lean();

    // Get painter reward transactions
    const transactions = await RewardTransaction.find({
      user: painterId,
      userType: "PAINTER",
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,

      wallet: {
        currentPoints: wallet?.currentPoints || 0,
        currentCashBalance: wallet?.currentCashBalance || 0,
        lifetimeEarnings: wallet?.lifetimeEarnings || 0,
      },

      transactions,
    });
  } catch (error) {
    console.error(
      "Get Painter Reward Wallet Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reward wallet data",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterRewardWallet,
};