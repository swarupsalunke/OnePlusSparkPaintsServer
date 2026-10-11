
const mongoose = require("mongoose");
const Complaint = require("../../models/salesExecutive/Complaint");
const User = require("../../models/superadmin/User");

// Generate Complaint ID
const generateComplaintId = () => {
  return `CMP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// CREATE COMPLAINT
// POST /api/sales-executive/complaints
const createComplaint = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Valid Sales Executive authentication is required",
      });
    }

    const user = await User.findById(userId);

    if (!user || user.role !== "SALES_EXECUTIVE") {
      return res.status(403).json({
        success: false,
        message: "Only Sales Executives can create complaints",
      });
    }

    const { complaintType, painter, dealer, product, priority, description } =
      req.body;

    const allowedTypes = ["PAINTER", "DEALER", "PRODUCT", "SERVICE"];
    const allowedPriorities = ["LOW", "MEDIUM", "HIGH"];

    if (!allowedTypes.includes(complaintType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint type",
      });
    }

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint priority",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Complaint description is required",
      });
    }

    // Validate selected entity based on complaint type
    let selectedEntity = null;
    let entityField = null;

    if (complaintType === "PAINTER") {
      selectedEntity = painter;
      entityField = "painter";
    } else if (complaintType === "DEALER") {
      selectedEntity = dealer;
      entityField = "dealer";
    } else if (complaintType === "PRODUCT") {
      selectedEntity = product;
      entityField = "product";
    }

    if (entityField) {
      if (
        !selectedEntity ||
        !mongoose.isValidObjectId(selectedEntity)
      ) {
        return res.status(400).json({
          success: false,
          message: `Please select a valid ${complaintType.toLowerCase()}`,
        });
      }
    }

    const images = (req.files?.images || []).map(
      (file) => `/uploads/documents/${file.filename}`
    );

    const documents = (req.files?.documents || []).map(
      (file) => `/uploads/documents/${file.filename}`
    );

    const complaint = await Complaint.create({
      complaintId: generateComplaintId(),
      complaintType,
      painter: complaintType === "PAINTER" ? painter : null,
      dealer: complaintType === "DEALER" ? dealer : null,
      product: complaintType === "PRODUCT" ? product : null,
      priority,
      description: description.trim(),
      images,
      documents,
      status: "NEW",
      createdBy: user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    console.error("Create Complaint Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit complaint",
      error: error.message,
    });
  }
};

// GET COMPLAINT HISTORY FOR LOGGED-IN SALES EXECUTIVE
// GET /api/sales-executive/complaints
const getMyComplaints = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Valid authentication is required",
      });
    }

    const complaints = await Complaint.find()
  .populate("painter", "name mobile email city painterId")
  .populate("dealer", "name userId mobile email")
  .populate("product")
  .populate("createdBy", "name userId email")
  .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("Get My Complaints Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint history",
    });
  }
};

// GET ALL COMPLAINTS FOR ADMIN
// GET /api/superadmin/complaints
const getAllComplaints = async (req, res) => {
  try {
    if (req.user?.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can view all complaints",
      });
    }

    const complaints = await Complaint.find()
      .populate("painter")
      .populate("dealer", "name userId mobile email")
      .populate("product")
      .populate("createdBy", "name userId email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("Get All Complaints Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
    });
  }
};

// UPDATE COMPLAINT STATUS (ADMIN)
// PATCH /api/superadmin/complaints/:id/status
const updateComplaintStatus = async (req, res) => {
  try {
    if (req.user?.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can update complaint status",
      });
    }

    const { id } = req.params;
    const { status, assignedDepartment } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    const allowedStatuses = [
      "NEW",
      "ASSIGNED",
      "UNDER_REVIEW",
      "RESOLVED",
      "CLOSED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint status",
      });
    }

    const updateData = { status };

    if (assignedDepartment !== undefined) {
      updateData.assignedDepartment = assignedDepartment.trim();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (error) {
    console.error("Update Complaint Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update complaint",
    });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
};
