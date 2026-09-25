const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getComplaints,
  getComplaintDetails,
  addComplaintComment,
  closeComplaint,
  getComplaintHistory,
  getComplaintStats,
  updateComplaintStatus,
} = require("../../controllers/painter/complaintController");

const complaintUpload = require("../../middleware/complaintUpload");

router.post("/", complaintUpload.array("attachments", 5), createComplaint);

router.get("/", getComplaints);

router.get("/stats", getComplaintStats);

router.get("/history", getComplaintHistory);

router.get("/:id", getComplaintDetails);

router.post("/:id/comments", addComplaintComment);

router.put("/:id/status", updateComplaintStatus);

router.put("/:id/close", closeComplaint);

module.exports = router;