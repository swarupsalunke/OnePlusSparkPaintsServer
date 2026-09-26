const RewardWallet = require("../../models/superadmin/RewardWallet");
const RewardTransaction = require("../../models/superadmin/RewardTransaction");
const User = require("../../models/superadmin/User");
const Scheme = require("../../models/superadmin/schemeModel");
const PainterScan = require("../../models/painter/PainterScan");

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

    const totalRewardPoints =
      wallet?.currentPoints || 0;

    const totalCashRewards =
      wallet?.currentCashBalance || 0;

    const pendingRewards =
      wallet?.pendingRewards || 0;

    // ==========================================
    // PRODUCT SCANS
    // ==========================================

    const productScans = await PainterScan.countDocuments({
      painter: painterId,
      scanStatus: "VALID",
    });

    // ==========================================
    // RECENT REWARD TRANSACTIONS
    // ==========================================

    const transactions =
      await RewardTransaction.find({
        user: painterId,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    // ==========================================
    // LATEST REWARD
    // ==========================================

    const latestReward = transactions.length
      ? transactions[0]
      : null;

    // ==========================================
    // MONTHLY REWARD SUMMARY
    // Last 6 Months
    // ==========================================

    const now = new Date();

    const monthlyStartDate = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1
    );

    const monthlyEndDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    const monthlyTransactions =
      await RewardTransaction.find({
        user: painterId,
        userType: "PAINTER",
        rewardType: "POINTS",
        transactionType: "ADD",
        status: {
          $nin: ["REJECTED", "REVERSED"],
        },
        createdAt: {
          $gte: monthlyStartDate,
          $lt: monthlyEndDate,
        },
      })
        .sort({ createdAt: 1 })
        .lean();

    // ==========================================
    // CREATE LAST 6 MONTHS
    // ==========================================

    const monthlyRewardSummary = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const year = monthDate.getFullYear();
      const monthIndex = monthDate.getMonth();

      const monthName =
        monthDate.toLocaleString("en-US", {
          month: "short",
        });

      const monthPoints =
        monthlyTransactions
          .filter((transaction) => {
            const transactionDate = new Date(
              transaction.createdAt
            );

            return (
              transactionDate.getFullYear() === year &&
              transactionDate.getMonth() ===
                monthIndex
            );
          })
          .reduce(
            (total, transaction) =>
              total +
              Number(transaction.points || 0),
            0
          );

      monthlyRewardSummary.push({
        month: monthName,
        year,
        points: monthPoints,
        current:
          year === now.getFullYear() &&
          monthIndex === now.getMonth(),
      });
    }

    // ==========================================
    // CALCULATE CHART PERCENTAGE
    // ==========================================

    const maxMonthlyPoints = Math.max(
      ...monthlyRewardSummary.map(
        (item) => item.points
      ),
      1
    );

    monthlyRewardSummary.forEach((item) => {
      item.percentage = Math.round(
        (item.points / maxMonthlyPoints) * 100
      );
    });

    // ==========================================
    // ACTIVE SCHEMES
    // ==========================================

    const activeSchemes =
      await Scheme.find({
        applicableTo: {
          $in: ["PAINTERS", "BOTH"],
        },
        status: "ACTIVE",
      })
        .sort({ createdAt: -1 })
        .lean();

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
        productScans,
      },

      latestReward,

      monthlyRewardSummary,

      recentRewards: transactions,

      activeSchemes,
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