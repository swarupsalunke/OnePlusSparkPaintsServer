const Notification = require("../../models/superadmin/notificationModel");

// =====================================================
// GET PAINTER NOTIFICATIONS
// =====================================================
exports.getPainterNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userType: { $in: ["PAINTERS", "ALL_USERS"] },
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get painter notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch painter notifications",
      error: error.message,
    });
  }
};


// =====================================================
// GET SINGLE PAINTER NOTIFICATION
// =====================================================
exports.getPainterNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userType: { $in: ["PAINTERS", "ALL_USERS"] },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error(
      "Get painter notification by ID error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch notification details",
      error: error.message,
    });
  }
};