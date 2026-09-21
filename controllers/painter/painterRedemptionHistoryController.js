const RedemptionRequest = require("../../models/painter/RedemptionRequest");

// GET /api/painter/redemption-history
const getPainterRedemptionHistory = async (req, res) => {
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

    const redemptions = await RedemptionRequest.find({
      painter: painterId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      redemptions: redemptions.map((redemption) => ({
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
      })),
    });
  } catch (error) {
    console.error(
      "Get Painter Redemption History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch redemption history",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterRedemptionHistory,
};