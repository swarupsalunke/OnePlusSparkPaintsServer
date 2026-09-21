const RewardWallet = require("../../models/superadmin/RewardWallet");
const RewardTransaction = require("../../models/superadmin/RewardTransaction");

/* =====================================================
   GET PAINTER REWARD DASHBOARD
   ===================================================== */

const getPainterRewardDashboard = async (req, res) => {
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

    /* =====================================================
       GET PAINTER WALLET
    ===================================================== */

    const wallet = await RewardWallet.findOne({
      user: painterId,
      userType: "PAINTER",
    }).lean();

    /* =====================================================
       GET PAINTER REWARD TRANSACTIONS
    ===================================================== */

    const transactions = await RewardTransaction.find({
      user: painterId,
      userType: "PAINTER",
    })
      .sort({ createdAt: -1 })
      .lean();

    /* =====================================================
       SUMMARY
    ===================================================== */

    const summary = {
      availablePoints: wallet?.currentPoints || 0,
      cashRewards: wallet?.currentCashBalance || 0,
      pendingRewards: wallet?.pendingRewards || 0,
      lifetimeRewards: wallet?.lifetimeEarnings || 0,
    };

    /* =====================================================
       MONTHLY REWARDS COLLECTED
       Last 6 Months
    ===================================================== */

    const monthlyRewardsMap = {};

    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      monthlyRewardsMap[key] = {
        month: date.toLocaleString("en-US", {
          month: "short",
        }),
        value: 0,
      };
    }

    transactions.forEach((transaction) => {
      if (!transaction.createdAt) return;

      const transactionDate = new Date(transaction.createdAt);

      const key = `${transactionDate.getFullYear()}-${String(
        transactionDate.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyRewardsMap[key]) return;

      /*
        Rewards Collected is calculated from credited points.
        Only completed/approved/released reward transactions
        are included.
      */

      const validStatuses = [
        "APPROVED",
        "RELEASED",
        "COMPLETED",
      ];

      if (!validStatuses.includes(transaction.status)) {
        return;
      }

      const points = Number(transaction.points) || 0;

      monthlyRewardsMap[key].value += points;
    });

    const monthlyRewards = Object.values(monthlyRewardsMap);

    /* =====================================================
       REWARD SPLIT
    ===================================================== */

    let pointsTotal = 0;
    let cashTotal = 0;
    let pendingTotal = 0;

    transactions.forEach((transaction) => {
      const points = Number(transaction.points) || 0;
      const cash = Number(transaction.cashAmount) || 0;

      if (transaction.status === "PENDING") {
        pendingTotal += points + cash;
        return;
      }

      if (
        ["APPROVED", "RELEASED", "COMPLETED"].includes(
          transaction.status
        )
      ) {
        if (transaction.rewardType === "POINTS") {
          pointsTotal += points;
        }

        if (transaction.rewardType === "CASH") {
          cashTotal += cash;
        }
      }
    });

    const splitTotal =
      pointsTotal + cashTotal + pendingTotal;

    const rewardSplit = {
      points:
        splitTotal > 0
          ? Number(((pointsTotal / splitTotal) * 100).toFixed(2))
          : 0,

      cash:
        splitTotal > 0
          ? Number(((cashTotal / splitTotal) * 100).toFixed(2))
          : 0,

      pending:
        splitTotal > 0
          ? Number(((pendingTotal / splitTotal) * 100).toFixed(2))
          : 0,
    };

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,
      summary,
      monthlyRewards,
      rewardSplit,
    });
  } catch (error) {
    console.error(
      "Get Painter Reward Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reward dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterRewardDashboard,
};