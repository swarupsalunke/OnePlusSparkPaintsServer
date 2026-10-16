const express = require("express");

const {
  createLeave,
  getAllLeaves,
  getLeaveById,
  updateLeave,
  updateManagerApproval,
  updateHRApproval,
  deleteLeave,
} = require("../controllers/leaveController");

const router = express.Router();

// Create Leave Request
router.post("/", createLeave);

// Get All Leave Requests
router.get("/", getAllLeaves);

// Get Single Leave Request
router.get("/:id", getLeaveById);

// Update Leave Request
router.put("/:id", updateLeave);

// Manager Approval
router.put("/:id/manager-approval", updateManagerApproval);

// HR Approval
router.put("/:id/hr-approval", updateHRApproval);

// Delete Leave Request
router.delete("/:id", deleteLeave);

module.exports = router;