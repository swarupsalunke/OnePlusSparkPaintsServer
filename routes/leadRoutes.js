const express = require("express");

const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
} = require("../controllers/leadController");

const router = express.Router();


// ==========================================
// POST /api/leads
// ==========================================

router.post("/", createLead);


// ==========================================
// GET /api/leads
// ==========================================

router.get("/", getAllLeads);


// ==========================================
// GET /api/leads/:id
// ==========================================

router.get("/:id", getLeadById);


// ==========================================
// PUT /api/leads/:id
// ==========================================

router.put("/:id", updateLead);


// ==========================================
// DELETE /api/leads/:id
// ==========================================

router.delete("/:id", deleteLead);


module.exports = router;