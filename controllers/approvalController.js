const ApprovalRequest = require("../models/approvalRequest");

// Get Approval Dashboard
const getApprovalDashboard = async (req, res) => {
  try {
    const requests = await ApprovalRequest.find();

    const totalRequests = requests.length;

    const pendingMyApproval = requests.filter(
      (request) =>
        request.status === "Pending" &&
        request.currentStage === "Checker Approval"
    ).length;

    const pendingOthers = requests.filter(
      (request) =>
        request.status === "Pending" &&
        request.currentStage === "Maker Approval"
    ).length;

    const approved = requests.filter(
      (request) => request.status === "Approved"
    ).length;

    const rejected = requests.filter(
      (request) => request.status === "Rejected"
    ).length;

    const completedRequests = requests.filter(
      (request) =>
        request.approvedAt && request.requestedAt
    );

    let averageApprovalTime = 0;

    if (completedRequests.length > 0) {
      const totalApprovalTime = completedRequests.reduce(
        (sum, request) =>
          sum +
          (new Date(request.approvedAt) -
            new Date(request.requestedAt)),
        0
      );

      averageApprovalTime =
        totalApprovalTime / completedRequests.length;
    }

    res.status(200).json({
      success: true,
      dashboard: {
        totalRequests,
        pendingMyApproval,
        pendingOthers,
        approved,
        rejected,
        averageApprovalTime,
      },
    });
  } catch (error) {
    console.error("Get approval dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch approval dashboard",
      error: error.message,
    });
  }
};

// Get All Approval Requests
const getApprovalRequests = async (req, res) => {
  try {
    const requests = await ApprovalRequest.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get approval requests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch approval requests",
      error: error.message,
    });
  }
};

// Get Approval Request By ID
const getApprovalRequestById = async (req, res) => {
  try {
    const request = await ApprovalRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Approval request not found",
      });
    }

    res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get approval request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch approval request",
      error: error.message,
    });
  }
};

// Create Approval Request
const createApprovalRequest = async (req, res) => {
  try {
    const {
      requestId,
      moduleType,
      requestType,
      requestDetails,
      requestedBy,
      amount,
      maker,
      remarks,
    } = req.body;

    if (
      !requestId ||
      !moduleType ||
      !requestedBy
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const existingRequest =
      await ApprovalRequest.findOne({ requestId });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Request ID already exists",
      });
    }

    const request = await ApprovalRequest.create({
      requestId,
      moduleType,
      requestType,
      requestDetails,
      requestedBy,
      amount,
      maker: maker || requestedBy,
      remarks,
      currentStage: "Checker Approval",
      status: "Pending",
      auditTrail: [
        {
          action: "Request Created",
          performedBy: maker || requestedBy,
          remarks: remarks || "",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Approval request created successfully",
      request,
    });
  } catch (error) {
    console.error("Create approval request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create approval request",
      error: error.message,
    });
  }
};

// Approve Request
const approveRequest = async (req, res) => {
  try {
    const { checker, remarks } = req.body;

    if (!checker) {
      return res.status(400).json({
        success: false,
        message: "Checker is required",
      });
    }

    const request = await ApprovalRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Approval request not found",
      });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be approved",
      });
    }

    request.status = "Approved";
    request.currentStage = "Completed";
    request.checker = checker;
    request.approvedAt = new Date();
    request.remarks = remarks || request.remarks;

    request.auditTrail.push({
      action: "Approved",
      performedBy: checker,
      remarks: remarks || "",
    });

    await request.save();

    res.status(200).json({
      success: true,
      message: "Approval request approved successfully",
      request,
    });
  } catch (error) {
    console.error("Approve request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to approve request",
      error: error.message,
    });
  }
};

// Reject Request
const rejectRequest = async (req, res) => {
  try {
    const { checker, remarks } = req.body;

    if (!checker) {
      return res.status(400).json({
        success: false,
        message: "Checker is required",
      });
    }

    const request = await ApprovalRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Approval request not found",
      });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be rejected",
      });
    }

    request.status = "Rejected";
    request.currentStage = "Completed";
    request.checker = checker;
    request.rejectedAt = new Date();
    request.remarks = remarks || request.remarks;

    request.auditTrail.push({
      action: "Rejected",
      performedBy: checker,
      remarks: remarks || "",
    });

    await request.save();

    res.status(200).json({
      success: true,
      message: "Approval request rejected successfully",
      request,
    });
  } catch (error) {
    console.error("Reject request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reject request",
      error: error.message,
    });
  }
};

// Update Approval Request
const updateApprovalRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedRequest = await ApprovalRequest.findByIdAndUpdate(
      id,
      {
        moduleType: req.body.moduleType,
        requestType: req.body.requestType,
        requestDetails: req.body.requestDetails,
        requestedBy: req.body.requestedBy,
        amount: req.body.amount,
        currentStage: req.body.currentStage,
        maker: req.body.maker,
        checker: req.body.checker,
        remarks: req.body.remarks,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        message: "Approval request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Approval request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update approval request",
      error: error.message,
    });
  }
};

// Delete Approval Request
const deleteApprovalRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRequest = await ApprovalRequest.findByIdAndDelete(id);

    if (!deletedRequest) {
      return res.status(404).json({
        message: "Approval request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Approval request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete approval request",
      error: error.message,
    });
  }
};

module.exports = {
  getApprovalDashboard,
  getApprovalRequests,
  getApprovalRequestById,
  createApprovalRequest,
  approveRequest,
  rejectRequest,
  updateApprovalRequest,
  deleteApprovalRequest,
};