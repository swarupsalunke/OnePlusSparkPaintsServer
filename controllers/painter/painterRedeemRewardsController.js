const RewardWallet = require("../../models/superadmin/RewardWallet");
const RedemptionRequest = require("../../models/painter/RedemptionRequest");

const getPainterRedeemRewards = async (req, res) => {
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

    return res.status(200).json({
      success: true,
      wallet: {
        availablePoints: wallet?.currentPoints || 0,
        cashRewards: wallet?.currentCashBalance || 0,
      },
    });
  } catch (error) {
    console.error(
      "Get Painter Redeem Rewards Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch redeem rewards data",
      error: error.message,
    });
  }
};


const createPainterRedemptionRequest = async (req, res) => {
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

    const {
      rewardType,
      requestedAmount,
      payoutAccount,
      remarks,
    } = req.body;

    if (!rewardType || !["POINTS", "CASH"].includes(rewardType)) {
      return res.status(400).json({
        success: false,
        message: "Valid reward type is required",
      });
    }

    if (
      requestedAmount === undefined ||
      requestedAmount === null ||
      Number(requestedAmount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid redemption amount is required",
      });
    }

    if (!payoutAccount || !payoutAccount.trim()) {
      return res.status(400).json({
        success: false,
        message: "Bank / Reward Account is required",
      });
    }

    const amount = Number(requestedAmount);

    const wallet = await RewardWallet.findOne({
      user: painterId,
      userType: "PAINTER",
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Painter reward wallet not found",
      });
    }

    const availableAmount =
      rewardType === "POINTS"
        ? wallet.currentPoints
        : wallet.currentCashBalance;

    if (amount > availableAmount) {
      return res.status(400).json({
        success: false,
        message:
          rewardType === "POINTS"
            ? "Requested points exceed available points"
            : "Requested cash exceeds available cash rewards",
      });
    }

    const requestId = `RED-${Date.now()}`;

    const redemptionRequest =
      await RedemptionRequest.create({
        painter: painterId,
        requestId,
        rewardType,
        requestedAmount: amount,
        payoutAccount: payoutAccount.trim(),
        remarks: remarks?.trim() || "",
        status: "PENDING",
      });

    return res.status(201).json({
      success: true,
      message: "Redemption request created successfully",
      redemptionRequest: {
        _id: redemptionRequest._id,
        requestId: redemptionRequest.requestId,
        rewardType: redemptionRequest.rewardType,
        requestedAmount:
          redemptionRequest.requestedAmount,
        payoutAccount:
          redemptionRequest.payoutAccount,
        status: redemptionRequest.status,
        createdAt: redemptionRequest.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Create Painter Redemption Request Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create redemption request",
      error: error.message,
    });
  }
};


module.exports = {
  getPainterRedeemRewards,
  createPainterRedemptionRequest,
};