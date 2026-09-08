const express = require("express");

const router = express.Router();

const {
  createFollowUp,
  getAllFollowUps,
  getFollowUpById,
  updateFollowUp,
  addRemarks,
  scheduleFollowUp,
  assignOwnership,
  closeFollowUp,
  deleteFollowUp,
  getFollowUpStats,
} = require("../controllers/followUpController");

// =====================================================
// FOLLOW-UP STATISTICS
// =====================================================

router.get("/stats", getFollowUpStats);


// =====================================================
// CREATE FOLLOW-UP
// =====================================================

router.post("/", createFollowUp);


// =====================================================
// GET ALL FOLLOW-UPS
// =====================================================

router.get("/", getAllFollowUps);


// =====================================================
// GET SINGLE FOLLOW-UP
// =====================================================

router.get("/:id", getFollowUpById);


// =====================================================
// UPDATE FOLLOW-UP
// =====================================================

router.put("/:id", updateFollowUp);


// delete follow UP

router.delete("/:id", deleteFollowUp);


// =====================================================
// ADD REMARKS
// =====================================================

router.patch("/:id/remarks", addRemarks);


// =====================================================
// SCHEDULE FOLLOW-UP
// =====================================================

router.patch("/:id/schedule", scheduleFollowUp);


// =====================================================
// ASSIGN OWNERSHIP
// =====================================================

router.patch("/:id/assign", assignOwnership);


// =====================================================
// CLOSE FOLLOW-UP
// =====================================================

router.patch("/:id/close", closeFollowUp);


module.exports = router;