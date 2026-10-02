const express = require("express");
const router = express.Router();
const { createComplaint, getDealerComplaints, getComplaintById } = require("../../controllers/dealer/dealerComplaintController");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const dealerComplaintUpload = require("../../middleware/dealerComplaintUpload");

router.post("/", authMiddleware, roleMiddleware("DEALER"), dealerComplaintUpload.fields([{ name: "images", maxCount: 5 }, { name: "documents", maxCount: 5 }]), createComplaint);
router.get("/", authMiddleware, roleMiddleware("DEALER"), getDealerComplaints);
router.get("/:id", authMiddleware, roleMiddleware("DEALER"), getComplaintById);

module.exports = router;