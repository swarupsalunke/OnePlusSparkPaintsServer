const RedemptionRequest = require("../../models/painter/RedemptionRequest");

// GET /api/painter/redemption-status/:requestId
const getPainterRedemptionStatus = async (req, res) => {
  try {
    const painterId =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId;

    const { requestId } = req.params;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required",
      });
    }

    const redemption = await RedemptionRequest.findOne({
      painter: painterId,
      requestId,
    }).lean();

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: "Redemption request not found",
      });
    }

    return res.status(200).json({
      success: true,
      redemption: {
        _id: redemption._id,
        requestId: redemption.requestId,
        rewardType: redemption.rewardType,
        requestedAmount: redemption.requestedAmount,
        status: redemption.status,
        createdAt: redemption.createdAt,
        updatedAt: redemption.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Get Painter Redemption Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch redemption status",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterRedemptionStatus,
};