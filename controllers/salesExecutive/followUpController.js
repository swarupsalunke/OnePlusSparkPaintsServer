const FollowUp = require("../../models/salesExecutive/followUpModel");

// CREATE FOLLOW-UP
exports.createFollowUp = async (req, res) => {
  try {
    const {
      customerType,
      customerName,
      phone,
      reason,
      followUpDate,
      followUpTime,
      notes,
      status,
      nextFollowUpDate,
    } = req.body;

    if (
      !customerType ||
      !customerName?.trim() ||
      !reason ||
      !followUpDate ||
      !followUpTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required follow-up details",
      });
    }

    const followUp = await FollowUp.create({
      salesExecutiveId: req.user?._id || req.user?.id || null,
      customerType,
      customerName: customerName.trim(),
      phone: phone || "",
      reason,
      followUpDate,
      followUpTime,
      notes: notes || "",
      status: status || "Pending",
      nextFollowUpDate: nextFollowUpDate || "",
    });

    return res.status(201).json({
      success: true,
      message: "Follow-up created successfully",
      followUp,
    });
  } catch (error) {
    console.error("Create follow-up error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create follow-up",
      error: error.message,
    });
  }
};

// GET FOLLOW-UPS
exports.getFollowUps = async (req, res) => {
  try {
    const filter = {};

    if (req.user?._id || req.user?.id) {
      filter.salesExecutiveId = req.user._id || req.user.id;
    }

    const followUps = await FollowUp.find(filter).sort({
      followUpDate: 1,
      followUpTime: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: followUps.length,
      followUps,
    });
  } catch (error) {
    console.error("Get follow-ups error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch follow-ups",
      error: error.message,
    });
  }
};

// GET SINGLE FOLLOW-UP
exports.getFollowUpById = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    if (
      (req.user?._id || req.user?.id) &&
      String(followUp.salesExecutiveId) !==
        String(req.user._id || req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this follow-up",
      });
    }

    return res.status(200).json({
      success: true,
      followUp,
    });
  } catch (error) {
    console.error("Get follow-up error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch follow-up",
      error: error.message,
    });
  }
};

// UPDATE FOLLOW-UP
exports.updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    if (
      (req.user?._id || req.user?.id) &&
      String(followUp.salesExecutiveId) !==
        String(req.user._id || req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this follow-up",
      });
    }

    const allowedFields = [
      "customerType",
      "customerName",
      "phone",
      "reason",
      "followUpDate",
      "followUpTime",
      "notes",
      "status",
      "nextFollowUpDate",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        followUp[field] =
          field === "customerName"
            ? req.body[field].trim()
            : req.body[field];
      }
    });

    await followUp.save();

    return res.status(200).json({
      success: true,
      message: "Follow-up updated successfully",
      followUp,
    });
  } catch (error) {
    console.error("Update follow-up error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update follow-up",
      error: error.message,
    });
  }
};

// UPDATE FOLLOW-UP STATUS
exports.updateFollowUpStatus = async (req, res) => {
  try {
    const { status, nextFollowUpDate } = req.body;

    if (!["Pending", "Completed", "Rescheduled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up status",
      });
    }

    if (status === "Rescheduled" && !nextFollowUpDate) {
      return res.status(400).json({
        success: false,
        message: "Next follow-up date is required when rescheduling",
      });
    }

    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    if (
      (req.user?._id || req.user?.id) &&
      String(followUp.salesExecutiveId) !==
        String(req.user._id || req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this follow-up",
      });
    }

    followUp.status = status;

    if (status === "Rescheduled") {
      followUp.nextFollowUpDate = nextFollowUpDate;
    }

    await followUp.save();

    return res.status(200).json({
      success: true,
      message: "Follow-up status updated successfully",
      followUp,
    });
  } catch (error) {
    console.error("Update follow-up status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update follow-up status",
      error: error.message,
    });
  }
};

// DELETE FOLLOW-UP
exports.deleteFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    if (
      (req.user?._id || req.user?.id) &&
      String(followUp.salesExecutiveId) !==
        String(req.user._id || req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this follow-up",
      });
    }

    await followUp.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Follow-up deleted successfully",
    });
  } catch (error) {
    console.error("Delete follow-up error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete follow-up",
      error: error.message,
    });
  }
};
