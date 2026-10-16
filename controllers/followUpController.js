const FollowUp = require("../models/FollowUp");

// =====================================================
// CREATE FOLLOW-UP
// =====================================================

exports.createFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.create(req.body);

    res.status(201).json({
      success: true,
      message: "Follow-up created successfully",
      followUp,
    });
  } catch (error) {
    console.error("Create follow-up error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create follow-up",
      error: error.message,
    });
  }
};


// =====================================================
// GET ALL FOLLOW-UPS
// =====================================================

exports.getAllFollowUps = async (req, res) => {
  try {
    const {
      status,
      triggerType,
      priority,
      assignedTo,
      search,
    } = req.query;

    const filter = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (triggerType && triggerType !== "ALL") {
      filter.triggerType = triggerType;
    }

    if (priority && priority !== "ALL") {
      filter.priority = priority;
    }

    if (assignedTo && assignedTo !== "ALL") {
      filter.assignedTo = assignedTo;
    }

    if (search) {
      filter.$or = [
        {
          customerName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          customerMobile: {
            $regex: search,
            $options: "i",
          },
        },
        {
          customerId: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const followUps = await FollowUp.find(filter)
      .sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: followUps.length,
      followUps,
    });
  } catch (error) {
    console.error("Get all follow-ups error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch follow-ups",
      error: error.message,
    });
  }
};


// =====================================================
// GET FOLLOW-UP BY ID
// =====================================================

exports.getFollowUpById = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    res.status(200).json({
      success: true,
      followUp,
    });
  } catch (error) {
    console.error("Get follow-up by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch follow-up",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE FOLLOW-UP
// =====================================================

exports.updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Follow-up updated successfully",
      followUp,
    });
  } catch (error) {
    console.error("Update follow-up error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update follow-up",
      error: error.message,
    });
  }
};


// =====================================================
// ADD REMARKS
// =====================================================

exports.addRemarks = async (req, res) => {
  try {
    const { remarks } = req.body;

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        success: false,
        message: "Remarks are required",
      });
    }

    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      {
        remarks: remarks.trim(),
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Remarks added successfully",
      followUp,
    });
  } catch (error) {
    console.error("Add remarks error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add remarks",
      error: error.message,
    });
  }
};


// =====================================================
// SCHEDULE FOLLOW-UP
// =====================================================

exports.scheduleFollowUp = async (req, res) => {
  try {
    const {
      scheduledDate,
      scheduledTime,
    } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date is required",
      });
    }

    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      {
        scheduledDate,
        scheduledTime: scheduledTime || "",
        status: "IN_PROGRESS",
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Follow-up scheduled successfully",
      followUp,
    });
  } catch (error) {
    console.error("Schedule follow-up error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to schedule follow-up",
      error: error.message,
    });
  }
};


// =====================================================
// ASSIGN OWNERSHIP
// =====================================================

exports.assignOwnership = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo || !assignedTo.trim()) {
      return res.status(400).json({
        success: false,
        message: "Assigned owner is required",
      });
    }

    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: assignedTo.trim(),
        status: "IN_PROGRESS",
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Follow-up assigned successfully",
      followUp,
    });
  } catch (error) {
    console.error("Assign ownership error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to assign follow-up",
      error: error.message,
    });
  }
};


// =====================================================
// CLOSE FOLLOW-UP
// =====================================================

exports.closeFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      {
        status: "CLOSED",
        closedAt: new Date(),
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Follow-up closed successfully",
      followUp,
    });
  } catch (error) {
    console.error("Close follow-up error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to close follow-up",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE FOLLOW-UP
// =====================================================

exports.deleteFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndDelete(
      req.params.id
    );

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Follow-up deleted successfully",
    });
  } catch (error) {
    console.error("Delete follow-up error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete follow-up",
      error: error.message,
    });
  }
};

// =====================================================
// FOLLOW-UP STATISTICS
// =====================================================

exports.getFollowUpStats = async (req, res) => {
  try {
    const now = new Date();

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    const [
      total,
      pending,
      inProgress,
      closed,
      overdue,
      today,
    ] = await Promise.all([
      FollowUp.countDocuments(),

      FollowUp.countDocuments({
        status: "PENDING",
      }),

      FollowUp.countDocuments({
        status: "IN_PROGRESS",
      }),

      FollowUp.countDocuments({
        status: "CLOSED",
      }),

      FollowUp.countDocuments({
        dueDate: { $lt: now },
        status: { $ne: "CLOSED" },
      }),

      FollowUp.countDocuments({
        dueDate: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
        status: { $ne: "CLOSED" },
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        inProgress,
        closed,
        overdue,
        today,
      },
    });
  } catch (error) {
    console.error("Get follow-up stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch follow-up statistics",
      error: error.message,
    });
  }
};