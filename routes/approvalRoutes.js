const express = require("express");

const {
  getApprovalDashboard,
  getApprovalRequests,
  getApprovalRequestById,
  createApprovalRequest,
  approveRequest,
  rejectRequest,
  updateApprovalRequest, 
  deleteApprovalRequest,
} = require("../controllers/approvalController");

const router = express.Router();

// Dashboard
router.get("/dashboard", getApprovalDashboard);

// All approval requests
router.get("/", getApprovalRequests);

// Single approval request
router.get("/:id", getApprovalRequestById);

// Create approval request
router.post("/", createApprovalRequest);

// Approve request
router.put("/:id/approve", approveRequest);

// Reject request
router.put("/:id/reject", rejectRequest);

// Update approval request
router.put("/:id", updateApprovalRequest);

// Delete approval request
router.delete("/:id", deleteApprovalRequest);

module.exports = router;