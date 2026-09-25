const PainterNotificationSettings = require("../../models/painter/PainterNotificationSettings");

const getNotificationSettings = async (req, res) => {
  try {
    const painterId = req.user.userId;

    let settings = await PainterNotificationSettings.findOne({ painterId });

    if (!settings) {
      settings = await PainterNotificationSettings.create({ painterId });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get Notification Settings Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notification settings",
      error: error.message,
    });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const painterId = req.user.userId;

    const {
      rewardCredited,
      newSchemesOffers,
      leadUpdates,
      orderEnquiryUpdates,
      complaintUpdates,
      marketingCampaigns,
    } = req.body;

    const settings = await PainterNotificationSettings.findOneAndUpdate(
      { painterId },
      {
        rewardCredited,
        newSchemesOffers,
        leadUpdates,
        orderEnquiryUpdates,
        complaintUpdates,
        marketingCampaigns,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Notification settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update Notification Settings Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notification settings",
      error: error.message,
    });
  }
};

module.exports = {
  getNotificationSettings,
  updateNotificationSettings,
};