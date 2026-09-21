const RewardWallet = require("../../models/superadmin/RewardWallet");
const RedemptionRequest = require("../../models/painter/RedemptionRequest");

// GET /api/painter/redemption-dashboard
const getPainterRedemptionDashboard = async (req, res) => {
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

    // Get recent redemption requests
    const recentRedemptions = await RedemptionRequest.find({
      painter: painterId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,

      summary: {
        availablePoints: wallet?.currentPoints || 0,
        cashRewards: wallet?.currentCashBalance || 0,
        pending: wallet?.pendingRewards || 0,
        redeemed: wallet?.redeemedAmount || 0,
      },

      recentRedemptions: recentRedemptions.map(
        (redemption) => ({
          _id: redemption._id,
          requestId: redemption.requestId,
          date: redemption.createdAt,
          type:
            redemption.rewardType === "POINTS"
              ? "Points"
              : redemption.rewardType === "CASH"
              ? "Cash"
              : redemption.rewardType || "-",
          amount: redemption.requestedAmount || 0,
          status: redemption.status || "-",
        })
      ),
    });
  } catch (error) {
    console.error(
      "Get Painter Redemption Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch redemption dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterRedemptionDashboard,
};