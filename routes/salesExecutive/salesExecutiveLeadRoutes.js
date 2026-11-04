const express = require("express");
const router = express.Router();

const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
} = require("../../controllers/salesExecutive/salesExecutiveLeadController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// Authentication and Sales Executive role protection
router.use(authMiddleware, roleMiddleware("SALES_EXECUTIVE"));

router.post("/", createLead);
router.get("/", getAllLeads);
router.get("/:id", getLeadById);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);

module.exports = router;