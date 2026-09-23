const Referral = require("../../models/painter/referralModel");

const getUserId = (req) => {
  return req.user?.id || req.user?._id || req.user?.userId;
};

const generateReferralCode = (userId) => {
  const shortId = userId.toString().slice(-4).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `PAINTER-${shortId}-${random}`;
};

// Get Referral Dashboard
exports.getReferralDashboard = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication token",
      });
    }

    const referrals = await Referral.find({
      referrer: userId,
    });

    const totalReferrals = referrals.length;

    const pending = referrals.filter(
      (referral) => referral.status === "PENDING"
    ).length;

    const converted = referrals.filter(
      (referral) => referral.status === "CONVERTED"
    ).length;

    const rewardsEarned = referrals.reduce(
      (total, referral) => total + (referral.reward || 0),
      0
    );

    const successRate =
      totalReferrals > 0
        ? Math.round((converted / totalReferrals) * 100)
        : 0;

    res.status(200).json({
      success: true,
      dashboard: {
        totalReferrals,
        pending,
        rewardsEarned,
        successRate,
      },
    });
  } catch (error) {
    console.error("Get referral dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch referral dashboard",
      error: error.message,
    });
  }
};

// Create Referral
exports.createReferral = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication token",
      });
    }

    const { referredName, category } = req.body;

    if (!referredName || !category) {
      return res.status(400).json({
        success: false,
        message: "Referred name and category are required",
      });
    }

    let referralCode;
    let isUnique = false;

    while (!isUnique) {
      referralCode = generateReferralCode(userId);

      const existingReferral = await Referral.findOne({
        referralCode,
      });

      if (!existingReferral) {
        isUnique = true;
      }
    }

    const referral = await Referral.create({
      referrer: userId,
      referralCode,
      referredName,
      category,
      status: "PENDING",
      referralShared: false,
    });

    res.status(201).json({
      success: true,
      message: "Referral created successfully",
      referral,
    });
  } catch (error) {
    console.error("Create referral error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create referral",
      error: error.message,
    });
  }
};

// Get Share Referral Details
exports.getShareReferral = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication token",
      });
    }

    const referral = await Referral.findOne({
      referrer: userId,
    }).sort({ createdAt: -1 });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "No referral found",
      });
    }

    res.status(200).json({
      success: true,
      referral: {
        _id: referral._id,
        referralCode: referral.referralCode,
        referredName: referral.referredName,
        category: referral.category,
        referralShared: referral.referralShared,
        sharedAt: referral.sharedAt,
      },
    });
  } catch (error) {
    console.error("Get share referral error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch share referral details",
      error: error.message,
    });
  }
};

// Get Referral History
exports.getReferralHistory = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication token",
      });
    }

    const referrals = await Referral.find({
      referrer: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: referrals.length,
      referrals,
    });
  } catch (error) {
    console.error("Get referral history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch referral history",
      error: error.message,
    });
  }
};