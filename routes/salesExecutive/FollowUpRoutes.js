
const express = require("express");
const router = express.Router();

const {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
  updateFollowUp,
  updateFollowUpStatus,
  deleteFollowUp,
} = require("../../controllers/salesExecutive/followUpController");

router.post("/", createFollowUp);
router.get("/", getFollowUps);
router.get("/:id", getFollowUpById);
router.put("/:id/status", updateFollowUpStatus);
router.put("/:id", updateFollowUp);
router.delete("/:id", deleteFollowUp);

module.exports = router;
