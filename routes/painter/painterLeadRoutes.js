const express = require("express");

const {
  createLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
} = require("../../controllers/painter/painterLeadController");

const router = express.Router();

router.post("/", createLead);
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.put("/:id/status", updateLeadStatus);

module.exports = router;