
const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
} = require("../../controllers/salesExecutive/complaintController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const uploadMiddleware = require("../../middleware/uploadMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Sales Executive: Submit complaint with images/documents
router.post(
  "/",
  roleMiddleware("SALES_EXECUTIVE"),
  uploadMiddleware.fields([
    { name: "images", maxCount: 10 },
    { name: "documents", maxCount: 10 },
  ]),
  createComplaint
);

// Sales Executive: View own complaint history
router.get(
  "/",
  roleMiddleware("SALES_EXECUTIVE"),
  getMyComplaints
);

// Super Admin: View all complaints
router.get(
  "/admin/all",
  roleMiddleware("SUPER_ADMIN"),
  getAllComplaints
);

// Super Admin: Update complaint status / department
router.patch(
  "/admin/:id/status",
  roleMiddleware("SUPER_ADMIN"),
  updateComplaintStatus
);

module.exports = router;
