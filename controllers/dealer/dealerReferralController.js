const DealerReferral = require("../../models/dealer/DealerReferral");

const generateReferralId = () => {
  return `REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const generateReferralCode = () => {
  return `REF${Date.now().toString().slice(-6)}${Math.floor(
    100 + Math.random() * 900
  )}`;
};

// Create Referral
const createReferral = async (req, res) => {
  try {
    const dealerId = req.user._id || req.user.id || req.user.userId;

    const {
      category,
      referredName,
      referredMobile,
      referredEmail,
      remarks,
    } = req.body;

    if (!category || !referredName || !referredMobile) {
      return res.status(400).json({
        success: false,
        message: "Category, referred name and mobile are required",
      });
    }

    const referral = await DealerReferral.create({
      referralId: generateReferralId(),
      referrer: dealerId,
      category,
      referredName,
      referredMobile,
      referredEmail: referredEmail || "",
      referralCode: generateReferralCode(),
      remarks: remarks || "",
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

// Get Referral List
const getDealerReferrals = async (req, res) => {
  try {
    const dealerId = req.user._id || req.user.id || req.user.userId;

    const referrals = await DealerReferral.find({
      referrer: dealerId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: referrals.length,
      referrals,
    });
  } catch (error) {
    console.error("Get referrals error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch referrals",
      error: error.message,
    });
  }
};

// Get Referral Details
const getReferralDetails = async (req, res) => {
  try {
    const dealerId = req.user._id || req.user.id || req.user.userId;

    const referral = await DealerReferral.findOne({
      _id: req.params.id,
      referrer: dealerId,
    });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found",
      });
    }

    res.status(200).json({
      success: true,
      referral,
    });
  } catch (error) {
    console.error("Get referral details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch referral details",
      error: error.message,
    });
  }
};

module.exports = {
  createReferral,
  getDealerReferrals,
  getReferralDetails,
};