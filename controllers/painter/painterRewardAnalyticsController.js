const RewardTransaction = require("../../models/superadmin/RewardTransaction");

const getPainterRewardAnalytics = async (req, res) => {
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

    const now = new Date();

    // Last 6 months including current month
    const monthlyStart = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1
    );

    const transactions = await RewardTransaction.find({
      user: painterId,
      userType: "PAINTER",
      createdAt: {
        $gte: monthlyStart,
        $lte: now,
      },
    })
      .sort({ createdAt: 1 })
      .lean();

    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      monthlyData.push({
        month: date.toLocaleString("en-US", {
          month: "short",
        }),
        year: date.getFullYear(),
        rewardsEarned: 0,
        scans: 0,
      });
    }

    transactions.forEach((transaction) => {
      const transactionDate = new Date(
        transaction.createdAt
      );

      const monthIndex = monthlyData.findIndex(
        (item) =>
          item.month ===
            transactionDate.toLocaleString("en-US", {
              month: "short",
            }) &&
          item.year === transactionDate.getFullYear()
      );

      if (monthIndex === -1) {
        return;
      }

      const points = Number(transaction.points || 0);

      const isRewardCredit =
        transaction.transactionType === "ADD" ||
        transaction.transactionType === "APPROVE" ||
        transaction.transactionType === "RELEASE";

      if (isRewardCredit) {
        monthlyData[monthIndex].rewardsEarned += points;
        monthlyData[monthIndex].scans += 1;
      }
    });

    // Last 30 days
    const last30DaysStart = new Date();
    last30DaysStart.setDate(
      last30DaysStart.getDate() - 30
    );

    const last30DaysTransactions =
      transactions.filter(
        (transaction) =>
          new Date(transaction.createdAt) >=
          last30DaysStart
      );

    const last30DaysRewards =
      last30DaysTransactions.filter(
        (transaction) =>
          transaction.transactionType === "ADD" ||
          transaction.transactionType === "APPROVE" ||
          transaction.transactionType === "RELEASE"
      );

    const totalRewardsLast30Days =
      last30DaysRewards.reduce(
        (total, transaction) =>
          total + Number(transaction.points || 0),
        0
      );

    const totalScansLast30Days =
      last30DaysRewards.length;

    const averageRewardPerScan =
      totalScansLast30Days > 0
        ? Number(
            (
              totalRewardsLast30Days /
              totalScansLast30Days
            ).toFixed(2)
          )
        : 0;

    // Redemption calculation
    const totalEarned = transactions
      .filter(
        (transaction) =>
          transaction.transactionType === "ADD" ||
          transaction.transactionType === "APPROVE" ||
          transaction.transactionType === "RELEASE"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.points || 0),
        0
      );

    const totalRedeemed = transactions
      .filter(
        (transaction) =>
          transaction.transactionType === "DEDUCT"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.points || 0),
        0
      );

    const redemptionRate =
      totalEarned > 0
        ? Number(
            ((totalRedeemed / totalEarned) * 100).toFixed(
              2
            )
          )
        : 0;

    // Best month
    const bestMonthData = monthlyData.reduce(
      (best, current) =>
        current.rewardsEarned > best.rewardsEarned
          ? current
          : best,
      {
        month: "-",
        year: null,
        rewardsEarned: 0,
        scans: 0,
      }
    );

    return res.status(200).json({
      success: true,
      analytics: {
        monthlyRewards: monthlyData,
        monthlyScans: monthlyData,
        averageRewardPerScan,
        redemptionRate,
        bestMonth: {
          month: bestMonthData.month,
          year: bestMonthData.year,
          rewardsEarned:
            bestMonthData.rewardsEarned,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get Painter Reward Analytics Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reward analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterRewardAnalytics,
};