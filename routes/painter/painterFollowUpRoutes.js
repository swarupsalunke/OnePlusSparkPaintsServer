const express = require("express");

const {
  createFollowUp,
  getFollowUps,
  getFollowUpsByLead,
} = require("../../controllers/painter/painterFollowUpController");

const router = express.Router();

router.post("/", createFollowUp);
router.get("/", getFollowUps);
router.get("/lead/:leadId", getFollowUpsByLead);

module.exports = router;    