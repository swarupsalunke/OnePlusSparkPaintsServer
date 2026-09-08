const User = require("../models/User");

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const activeUsers = await User.countDocuments({
      status: "ACTIVE",
    });

    const pendingKyc = await User.countDocuments({
      kycStatus: "PENDING",
    });

    const approvedKyc = await User.countDocuments({
      kycStatus: "APPROVED",
    });

    const rejectedKyc = await User.countDocuments({
      kycStatus: "REJECTED",
    });

    const correctionRequired = await User.countDocuments({
      kycStatus: "CORRECTION_REQUIRED",
    });

    const inactiveUsers = await User.countDocuments({
      status: "INACTIVE",
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        kyc: {
          pending: pendingKyc,
          approved: approvedKyc,
          rejected: rejectedKyc,
          correctionRequired,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

module.exports = {
  getDashboardStats,
};