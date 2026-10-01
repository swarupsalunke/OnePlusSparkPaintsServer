const DealerRewardRedemption = require("../../models/dealer/DealerRewardRedemption");
const RewardWallet = require("../../models/superadmin/RewardWallet");

const generateRedemptionId = () => {
  return `RED-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// CREATE REDEMPTION REQUEST
const createRedemptionRequest = async (req, res) => {
  try {
    const dealerId = req.user.userId;
    const { rewardType, points, cashAmount, description } = req.body;

    if (!rewardType || !["POINTS", "CASH"].includes(rewardType)) {
      return res.status(400).json({
        success: false,
        message: "Valid rewardType is required",
      });
    }

    const wallet = await RewardWallet.findOne({
      user: dealerId,
      userType: "DEALER",
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Reward wallet not found",
      });
    }

    if (rewardType === "POINTS") {
      if (!points || Number(points) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid points are required",
        });
      }

      if (wallet.currentPoints < Number(points)) {
        return res.status(400).json({
          success: false,
          message: "Insufficient reward points",
        });
      }
    }

    if (rewardType === "CASH") {
      if (!cashAmount || Number(cashAmount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid cash amount is required",
        });
      }

      if (wallet.currentCashBalance < Number(cashAmount)) {
        return res.status(400).json({
          success: false,
          message: "Insufficient cash balance",
        });
      }
    }

    const redemption = await DealerRewardRedemption.create({
      redemptionId: generateRedemptionId(),
      dealer: dealerId,
      rewardType,
      points: rewardType === "POINTS" ? Number(points) : 0,
      cashAmount: rewardType === "CASH" ? Number(cashAmount) : 0,
      status: "Pending",
      description: description || "",
    });

    res.status(201).json({
      success: true,
      message: "Redemption request submitted successfully",
      redemption,
    });
  } catch (error) {
    console.error("Create redemption request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create redemption request",
      error: error.message,
    });
  }
};

// GET DEALER REDEMPTION HISTORY
const getRedemptionHistory = async (req, res) => {
  try {
    const dealerId = req.user.userId;

    const redemptions = await DealerRewardRedemption.find({
      dealer: dealerId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      redemptions,
    });
  } catch (error) {
    console.error("Get redemption history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch redemption history",
      error: error.message,
    });
  }
};

// GET SINGLE REDEMPTION
const getRedemptionById = async (req, res) => {
  try {
    const dealerId = req.user.userId;
    const { id } = req.params;

    const redemption = await DealerRewardRedemption.findOne({
      _id: id,
      dealer: dealerId,
    });

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: "Redemption request not found",
      });
    }

    res.status(200).json({
      success: true,
      redemption,
    });
  } catch (error) {
    console.error("Get redemption details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch redemption details",
      error: error.message,
    });
  }
};

module.exports = {
  createRedemptionRequest,
  getRedemptionHistory,
  getRedemptionById,
};