const Leave = require("../models/leaveModel");

// Create Leave Request
exports.createLeave = async (req, res) => {
  try {
    const {
      employee,
      leaveType,
      startDate,
      endDate,
      reason,
      documents,
      delegation,
      isEmergency,
      remarks,
    } = req.body;

    if (
      !employee ||
      !leaveType ||
      !startDate ||
      !endDate ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Employee, leave type, start date, end date and reason are required",
      });
    }

    const leave = await Leave.create({
      employee,
      leaveType,
      startDate,
      endDate,
      reason,
      documents: documents || "",
      delegation: delegation || "",
      isEmergency: isEmergency || false,
      remarks: remarks || "",
    });

    await leave.populate([
      {
        path: "employee",
        select: "name email",
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      leave,
    });
  } catch (error) {
    console.error("Create leave error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create leave request",
      error: error.message,
    });
  }
};


// Get All Leave Requests
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error("Get leaves error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
};


// Get Single Leave Request
exports.getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate("employee", "name email");

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    res.status(200).json({
      success: true,
      leave,
    });
  } catch (error) {
    console.error("Get leave by id error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch leave request",
      error: error.message,
    });
  }
};


// Update Leave Request
exports.updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).populate("employee", "name email");

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave request updated successfully",
      leave,
    });
  } catch (error) {
    console.error("Update leave error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update leave request",
      error: error.message,
    });
  }
};


// Manager Approval
exports.updateManagerApproval = async (req, res) => {
  try {
    const { managerApproval, remarks } = req.body;

    if (
      !["APPROVED", "REJECTED"].includes(managerApproval)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Manager approval must be APPROVED or REJECTED",
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    leave.managerApproval = managerApproval;

    if (managerApproval === "REJECTED") {
      leave.status = "REJECTED";
    }

    if (remarks !== undefined) {
      leave.remarks = remarks;
    }

    await leave.save();

    await leave.populate("employee", "name email");

    res.status(200).json({
      success: true,
      message: "Manager approval updated successfully",
      leave,
    });
  } catch (error) {
    console.error("Manager approval error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update manager approval",
      error: error.message,
    });
  }
};


// HR Approval
exports.updateHRApproval = async (req, res) => {
  try {
    const { hrApproval, remarks } = req.body;

    if (!["APPROVED", "REJECTED"].includes(hrApproval)) {
      return res.status(400).json({
        success: false,
        message: "HR approval must be APPROVED or REJECTED",
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    leave.hrApproval = hrApproval;

    if (hrApproval === "APPROVED") {
      if (leave.managerApproval === "APPROVED") {
        leave.status = "APPROVED";
      }
    } else {
      leave.status = "REJECTED";
    }

    if (remarks !== undefined) {
      leave.remarks = remarks;
    }

    await leave.save();

    await leave.populate("employee", "name email");

    res.status(200).json({
      success: true,
      message: "HR approval updated successfully",
      leave,
    });
  } catch (error) {
    console.error("HR approval error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update HR approval",
      error: error.message,
    });
  }
};


// Delete Leave Request
exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave request deleted successfully",
    });
  } catch (error) {
    console.error("Delete leave error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete leave request",
      error: error.message,
    });
  }
};