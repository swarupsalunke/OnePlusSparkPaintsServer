const PainterScan = require("../../models/painter/PainterScan");
const PainterLead = require("../../models/painter/PainterLead");
const Referral = require("../../models/painter/referralModel");
const LoyaltyTier = require("../../models/painter/LoyaltyTier");
const RewardWallet = require("../../models/superadmin/RewardWallet");
const RewardTransaction = require("../../models/superadmin/RewardTransaction");


// =====================================================
// PERFORMANCE DASHBOARD
// GET /api/painter/analytics/performance-dashboard
// =====================================================
const getPerformanceDashboard = async (req, res) => {
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

    const [
      wallet,
      totalScans,
      completedLeads,
    ] = await Promise.all([
      RewardWallet.findOne({
        user: painterId,
        userType: "PAINTER",
      }).lean(),

      PainterScan.countDocuments({
        painter: painterId,
        scanStatus: "VALID",
      }),

      PainterLead.countDocuments({
        status: "Completed",
      }),
    ]);

    // Last 6 months scan trend
    const now = new Date();

    const scanTrend = [];

    for (let i = 5; i >= 0; i--) {
      const startDate = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const endDate = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        1
      );

      const scanCount = await PainterScan.countDocuments({
        painter: painterId,
        scanStatus: "VALID",
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      scanTrend.push({
        month: startDate.toLocaleString("en-US", {
          month: "short",
        }),
        year: startDate.getFullYear(),
        scans: scanCount,
      });
    }

    return res.status(200).json({
      success: true,

      summary: {
        rewardPoints: wallet?.currentPoints || 0,
        scans: totalScans,
        cashback: wallet?.currentCashBalance || 0,
        leadsCompleted: completedLeads,
      },

      performanceTrend: scanTrend,

      achievement: {
        status: "Available data only",
      },
    });
  } catch (error) {
    console.error(
      "Get Painter Performance Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch performance dashboard",
      error: error.message,
    });
  }
};


// =====================================================
// MONTHLY PERFORMANCE
// GET /api/painter/analytics/monthly-performance
// =====================================================
const getMonthlyPerformance = async (req, res) => {
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

    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const startDate = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const endDate = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        1
      );

      // Valid scans
      const scans = await PainterScan.countDocuments({
        painter: painterId,
        scanStatus: "VALID",
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      // Leads created in this month
      const leads = await PainterLead.countDocuments({
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      // Completed leads in this month
      const completedLeads = await PainterLead.countDocuments({
        status: "Completed",
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      // Rewards using existing project logic
      const rewardTransactions =
        await RewardTransaction.find({
          user: painterId,
          userType: "PAINTER",
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
          transactionType: {
            $in: ["ADD", "APPROVE", "RELEASE"],
          },
        }).lean();

      const rewardsEarned =
        rewardTransactions.reduce(
          (total, transaction) =>
            total + Number(transaction.points || 0),
          0
        );

      monthlyData.push({
        month: startDate.toLocaleString("en-US", {
          month: "short",
        }),
        year: startDate.getFullYear(),
        scans,
        rewardsEarned,
        leads,
        completedLeads,
        achievement: "Not defined",
      });
    }

    return res.status(200).json({
      success: true,
      monthlyPerformance: monthlyData,
    });
  } catch (error) {
    console.error(
      "Get Painter Monthly Performance Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly performance",
      error: error.message,
    });
  }
};


// =====================================================
// MILESTONE PROGRESS
// GET /api/painter/analytics/milestone-progress
// =====================================================
const getMilestoneProgress = async (req, res) => {
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

    const [
      totalScans,
      convertedReferrals,
      wallet,
      tiers,
    ] = await Promise.all([
      PainterScan.countDocuments({
        painter: painterId,
        scanStatus: "VALID",
      }),

      Referral.countDocuments({
        referrer: painterId,
        status: "CONVERTED",
      }),

      RewardWallet.findOne({
        user: painterId,
        userType: "PAINTER",
      }).lean(),

      LoyaltyTier.find({})
        .sort({ minPoints: 1 })
        .lean(),
    ]);

    const currentPoints =
      wallet?.currentPoints || 0;

    const platinumTier = tiers.find(
      (tier) => tier.name === "PLATINUM"
    );

    const platinumMinPoints =
      platinumTier?.minPoints || 0;

    const platinumProgress =
      platinumMinPoints > 0
        ? Math.min(
            100,
            Number(
              (
                (currentPoints / platinumMinPoints) *
                100
              ).toFixed(2)
            )
          )
        : 0;

    const currentTier =
      tiers
        .filter(
          (tier) =>
            currentPoints >= tier.minPoints &&
            (
              tier.maxPoints === null ||
              tier.maxPoints === undefined ||
              currentPoints <= tier.maxPoints
            )
        )
        .sort((a, b) => b.minPoints - a.minPoints)[0] ||
      null;

    return res.status(200).json({
      success: true,

      milestones: [
        {
          title: "50 Product Scans",
          current: totalScans,
          target: 50,
          progress: Math.min(
            100,
            Number(
              ((totalScans / 50) * 100).toFixed(2)
            )
          ),
          completed: totalScans >= 50,
        },

        {
          title: "100 Product Scans",
          current: totalScans,
          target: 100,
          progress: Math.min(
            100,
            Number(
              ((totalScans / 100) * 100).toFixed(2)
            )
          ),
          completed: totalScans >= 100,
        },

        {
          title: "5 Referrals Converted",
          current: convertedReferrals,
          target: 5,
          progress: Math.min(
            100,
            Number(
              (
                (convertedReferrals / 5) *
                100
              ).toFixed(2)
            )
          ),
          completed: convertedReferrals >= 5,
        },

        {
          title: "Platinum Tier",
          currentPoints,
          targetPoints: platinumMinPoints,
          progress: platinumProgress,
          completed:
            currentPoints >= platinumMinPoints &&
            platinumMinPoints > 0,
        },
      ],

      currentTier: currentTier?.name || "SILVER",
      currentPoints,
      platinumMinPoints,
    });
  } catch (error) {
    console.error(
      "Get Painter Milestone Progress Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch milestone progress",
      error: error.message,
    });
  }
};


module.exports = {
  getPerformanceDashboard,
  getMonthlyPerformance,
  getMilestoneProgress,
};