const Complaint = require("../../models/painter/Complaint");

const generateComplaintId = async () => {
  const lastComplaint = await Complaint.findOne()
    .sort({ createdAt: -1 })
    .select("complaintId");

  let nextNumber = 2001;

  if (lastComplaint && lastComplaint.complaintId) {
    const number = parseInt(
      lastComplaint.complaintId.replace("CMP-", ""),
      10
    );

    if (!isNaN(number)) {
      nextNumber = number + 1;
    }
  }

  return `CMP-${nextNumber}`;
};

const createComplaint = async (req, res) => {
  try {
    const { type, title, description, priority } = req.body;

    const painterId = req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    if (!type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Type, title and description are required",
      });
    }

    const complaintId = await generateComplaintId();

    const attachments = (req.files || []).map((file) => ({
      fileName: file.originalname,
      fileUrl: `/uploads/complaints/${file.filename}`,
      fileType: file.mimetype,
    }));

    const complaint = await Complaint.create({
      painterId,
      complaintId,
      type,
      title,
      description,
      priority: priority || "Medium",
      status: "Open",
      attachments,
    });

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("Create Complaint Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit complaint",
      error: error.message,
    });
  }
};

const getComplaints = async (req, res) => {
  try {
    const painterId = req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const complaints = await Complaint.find({
      painterId,
    })
      .sort({ createdAt: -1 })
      .select(
        "complaintId type title priority status submittedAt resolvedAt createdAt"
      );

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("Get Complaints Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

const getComplaintDetails = async (req, res) => {
  try {
    const painterId = req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      painterId,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    console.error("Get Complaint Details Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch complaint details",
      error: error.message,
    });
  }
};

const addComplaintComment = async (req, res) => {
  try {
    const painterId = req.user?.userId;
    const { comment } = req.body;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      painterId,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    complaint.comments.push({
      comment: comment.trim(),
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("Add Complaint Comment Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

const closeComplaint = async (req, res) => {
  try {
    const painterId = req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      painterId,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (complaint.status === "Closed") {
      return res.status(400).json({
        success: false,
        message: "Complaint is already closed",
      });
    }

    complaint.status = "Closed";
    complaint.resolvedAt = new Date();

    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint closed successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("Close Complaint Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to close complaint",
      error: error.message,
    });
  }
};

const getComplaintHistory = async (req, res) => {
  try {
    const painterId = req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const complaints = await Complaint.find({
      painterId,
    })
      .sort({ submittedAt: -1 })
      .select(
        "complaintId type submittedAt resolvedAt status"
      );

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("Get Complaint History Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch complaint history",
      error: error.message,
    });
  }
};

const getComplaintStats = async (req, res) => {
  try {
    const painterId = req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const [open, underReview, closed, total] = await Promise.all([
      Complaint.countDocuments({
        painterId,
        status: "Open",
      }),

      Complaint.countDocuments({
        painterId,
        status: "Under Review",
      }),

      Complaint.countDocuments({
        painterId,
        status: "Closed",
      }),

      Complaint.countDocuments({
        painterId,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        open,
        underReview,
        resolved: closed,
        total,
      },
    });
  } catch (error) {
    console.error("Get Complaint Stats Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch complaint statistics",
      error: error.message,
    });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const painterId = req.user?.userId;
    const { status } = req.body;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const allowedStatuses = [
      "Open",
      "Under Review",
      "Closed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint status",
      });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      painterId,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    complaint.status = status;

    if (status === "Closed") {
      complaint.resolvedAt = new Date();
    } else {
      complaint.resolvedAt = null;
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("Update Complaint Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update complaint status",
      error: error.message,
    });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintDetails,
  addComplaintComment,
  closeComplaint,
  getComplaintHistory,
  getComplaintStats,
  updateComplaintStatus,
};