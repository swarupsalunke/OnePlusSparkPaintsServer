const RewardWallet = require("../../models/superadmin/RewardWallet");
const RewardTransaction = require("../../models/superadmin/RewardTransaction");
const User = require("../../models/superadmin/User");

// ==========================================
// GET PAINTER DASHBOARD
// GET /api/painter/dashboard
// ==========================================

const getPainterDashboard = async (req, res) => {
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

    // ==========================================
    // PAINTER
    // ==========================================

    const painter = await User.findById(painterId).select(
      "name userId email mobile role profilePicture"
    );

    if (!painter) {
      return res.status(404).json({
        success: false,
        message: "Painter not found",
      });
    }

    // ==========================================
    // REWARD WALLET
    // ==========================================

    const wallet = await RewardWallet.findOne({
      user: painterId,
    });

    // ==========================================
    // REWARD TRANSACTIONS
    // ==========================================

    const transactions = await RewardTransaction.find({
      user: painterId,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const totalRewardPoints =
      wallet?.currentPoints || 0;

    const totalCashRewards =
      wallet?.currentCashBalance || 0;

    const pendingRewards =
      wallet?.pendingRewards || 0;

    // ==========================================
    // LATEST REWARD
    // ==========================================

    const latestReward = transactions.length
      ? transactions[0]
      : null;

    // ==========================================
    // MONTHLY REWARD SUMMARY
    // ==========================================

    const now = new Date();

    const monthlyTransactions =
      await RewardTransaction.find({
        user: painterId,
        createdAt: {
          $gte: new Date(
            now.getFullYear(),
            now.getMonth() - 5,
            1
          ),
        },
      }).sort({ createdAt: 1 });

    const monthlyRewardSummary =
      monthlyTransactions.reduce(
        (summary, transaction) => {
          const date = new Date(
            transaction.createdAt
          );

          const month = date.toLocaleString(
            "en-US",
            {
              month: "short",
            }
          );

          if (!summary[month]) {
            summary[month] = {
              month,
              points: 0,
              cash: 0,
            };
          }

          if (
            transaction.rewardType ===
            "POINTS"
          ) {
            summary[month].points += Number(
              transaction.points || 0
            );
          }

          if (
            transaction.rewardType ===
            "CASH"
          ) {
            summary[month].cash += Number(
              transaction.cashAmount || 0
            );
          }

          return summary;
        },
        {}
      );

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      painter: {
        id: painter._id,
        name: painter.name,
        userId: painter.userId,
        email: painter.email,
        mobile: painter.mobile,
        role: painter.role,
        profilePicture:
          painter.profilePicture,
      },

      summary: {
        totalRewardPoints,
        totalCashRewards,
        pendingRewards,
      },

      latestReward,

      monthlyRewardSummary:
        Object.values(
          monthlyRewardSummary
        ),

      recentRewards: transactions,
    });
  } catch (error) {
    console.error(
      "Get painter dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch painter dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterDashboard,
};