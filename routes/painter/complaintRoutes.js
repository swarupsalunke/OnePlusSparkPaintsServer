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

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  complaintUpload.array("attachments", 5),
  createComplaint
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getComplaints
);

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getComplaintStats
);

router.get(
  "/history",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getComplaintHistory
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getComplaintDetails
);

router.post(
  "/:id/comments",
  authMiddleware,
  roleMiddleware("PAINTER"),
  addComplaintComment
);

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("PAINTER"),
  updateComplaintStatus
);

router.put(
  "/:id/close",
  authMiddleware,
  roleMiddleware("PAINTER"),
  closeComplaint
);

module.exports = router;