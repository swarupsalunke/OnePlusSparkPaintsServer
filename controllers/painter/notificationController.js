const Notification = require("../../models/superadmin/notificationModel");

// Get notifications for logged-in Painter
const getPainterNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userType: { $in: ["PAINTERS", "ALL_USERS"] },
      status: "SENT",
    })
      .sort({ sentOn: -1 })
      .select(
        "title message sentOn channel link attachment attachmentType createdAt"
      );

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get painter notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch painter notifications",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterNotifications,
};