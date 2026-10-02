const DealerProfile = require("../../models/dealer/DealerProfile");
const User = require("../../models/superadmin/User");
const bcrypt = require("bcryptjs");

const getDealerId = (req) => {
  return req.user?._id || req.user?.id || req.user?.userId;
};

const getDealerProfile = async (req, res) => {
  try {
    const dealerId = getDealerId(req);

    const profile = await DealerProfile.findOne({
      dealer: dealerId,
    }).populate("dealer", "name email mobile role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Dealer profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get dealer profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dealer profile",
      error: error.message,
    });
  }
};

const createOrUpdateDealerProfile = async (req, res) => {
  try {
    const dealerId = getDealerId(req);

    const {
      dealerName,
      businessName,
      mobileNumber,
      email,
      gstNumber,
      panNumber,
      shopActNumber,
      registrationDate,
      businessAddress,
      city,
      district,
      state,
      pinCode,
    } = req.body;

    const profile = await DealerProfile.findOneAndUpdate(
      { dealer: dealerId },
      {
        dealer: dealerId,
        dealerName,
        businessName,
        mobileNumber,
        email,
        gstNumber,
        panNumber,
        shopActNumber,
        registrationDate: registrationDate || null,
        businessAddress,
        city,
        district,
        state,
        pinCode,
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Dealer profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update dealer profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update dealer profile",
      error: error.message,
    });
  }
};

const updateBankDetails = async (req, res) => {
  try {
    const dealerId = getDealerId(req);

    const {
      bankName,
      accountHolder,
      accountNumber,
      ifsc,
    } = req.body;

    const profile = await DealerProfile.findOneAndUpdate(
      { dealer: dealerId },
      {
        $set: {
          "bankDetails.bankName": bankName || "",
          "bankDetails.accountHolder": accountHolder || "",
          "bankDetails.accountNumber": accountNumber || "",
          "bankDetails.ifsc": ifsc || "",
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Bank details updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update bank details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update bank details",
      error: error.message,
    });
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    const dealerId = getDealerId(req);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile picture is required",
      });
    }

    const profilePicture = `/uploads/dealer-profile/${req.file.filename}`;

    const profile = await DealerProfile.findOneAndUpdate(
      { dealer: dealerId },
      {
        $set: {
          profilePicture,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      profilePicture: profile.profilePicture,
      profile,
    });
  } catch (error) {
    console.error("Update profile picture error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile picture",
      error: error.message,
    });
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const dealerId = getDealerId(req);

    const {
      orderUpdates,
      paymentUpdates,
      rewardUpdates,
      promotionalCampaigns,
    } = req.body;

    const profile = await DealerProfile.findOneAndUpdate(
      { dealer: dealerId },
      {
        $set: {
          "notificationPreferences.orderUpdates":
            orderUpdates ?? true,
          "notificationPreferences.paymentUpdates":
            paymentUpdates ?? true,
          "notificationPreferences.rewardUpdates":
            rewardUpdates ?? true,
          "notificationPreferences.promotionalCampaigns":
            promotionalCampaigns ?? true,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notification preferences",
      error: error.message,
    });
  }
};

const changeDealerPassword = async (req, res) => {
  try {
    const dealerId = getDealerId(req);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const dealer = await User.findById(dealerId);

    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: "Dealer not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      dealer.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    dealer.password = await bcrypt.hash(newPassword, 10);

    await dealer.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

module.exports = {
  getDealerProfile,
  createOrUpdateDealerProfile,
  updateBankDetails,
  updateProfilePicture,
  updateNotificationPreferences,
  changeDealerPassword,
};