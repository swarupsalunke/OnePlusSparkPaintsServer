const Notification = require("../models/notificationModel");

// =====================================================
// CREATE NOTIFICATION
// =====================================================
exports.createNotification = async (req, res) => {
  try {
    const {
      title,
      channel,
      userType,
      targetAudience,
      message,
      territory,
      status,
      sentTo,
      openRate,
      clickRate,
      link,
      attachment,
      attachmentType,
      whatsapp,
      socialMedia,
      pushNotification,
    } = req.body;

    const notification = await Notification.create({
      title,
      channel,
      userType,
      targetAudience,
      message,
      territory: territory || "",
      status: status || "PENDING",
      sentTo: Number(sentTo) || 0,
      openRate: openRate || "-",
      clickRate: clickRate || "-",
      link: link || "",
      attachment: attachment || "",
      attachmentType: attachmentType || "",
      whatsapp: whatsapp || false,
      socialMedia: socialMedia || false,
      pushNotification:
        pushNotification !== undefined
          ? pushNotification
          : true,
      sentOn: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: error.message,
    });
  }
};


// =====================================================
// GET ALL NOTIFICATIONS
// =====================================================
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};


// =====================================================
// GET SINGLE NOTIFICATION
// =====================================================
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(
      req.params.id
    );

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
    console.error("Get notification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE NOTIFICATION
// =====================================================
exports.updateNotification = async (req, res) => {
  try {
    const {
      title,
      channel,
      userType,
      targetAudience,
      message,
      territory,
      status,
      sentTo,
      openRate,
      clickRate,
      link,
      attachment,
      attachmentType,
      whatsapp,
      socialMedia,
      pushNotification,
    } = req.body;

    const notification =
      await Notification.findByIdAndUpdate(
        req.params.id,
        {
          title,
          channel,
          userType,
          targetAudience,
          message,
          territory:
            territory !== undefined ? territory : "",
          status:
            status !== undefined ? status : "PENDING",
          sentTo:
            sentTo !== undefined ? Number(sentTo) : 0,
          openRate:
            openRate !== undefined ? openRate : "-",
          clickRate:
            clickRate !== undefined ? clickRate : "-",
          link: link || "",
          attachment: attachment || "",
          attachmentType: attachmentType || "",
          whatsapp:
            whatsapp !== undefined ? whatsapp : false,
          socialMedia:
            socialMedia !== undefined
              ? socialMedia
              : false,
          pushNotification:
            pushNotification !== undefined
              ? pushNotification
              : true,
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      notification,
    });
  } catch (error) {
    console.error("Update notification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE NOTIFICATION
// =====================================================
exports.deleteNotification = async (req, res) => {
  try {
    const notification =
      await Notification.findByIdAndDelete(
        req.params.id
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};