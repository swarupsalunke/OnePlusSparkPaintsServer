const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  getFeedbackStats,
} = require("../controllers/feedbackController");

const router = express.Router();

// =====================================================
// DASHBOARD STATISTICS
// =====================================================

router.get("/stats", getFeedbackStats);

// =====================================================
// CREATE FEEDBACK
// =====================================================

// Optional attachments:
// image, audio, video
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  createFeedback
);

// =====================================================
// GET ALL FEEDBACK
// =====================================================

router.get("/", getAllFeedback);

// =====================================================
// GET SINGLE FEEDBACK
// =====================================================

router.get("/:id", getFeedbackById);

// =====================================================
// UPDATE FEEDBACK
// =====================================================

// Text/details update
// Attachments optional
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  updateFeedback
);

// =====================================================
// UPDATE FEEDBACK STATUS
// =====================================================

router.patch("/:id/status", updateFeedbackStatus);

// =====================================================
// DELETE FEEDBACK
// =====================================================

router.delete("/:id", deleteFeedback);

module.exports = router;