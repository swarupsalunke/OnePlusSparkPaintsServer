const express = require("express");

const {
  createLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
} = require("../../controllers/painter/painterLeadController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  createLead
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getLeads
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getLeadById
);

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("PAINTER"),
  updateLeadStatus
);

module.exports = router;