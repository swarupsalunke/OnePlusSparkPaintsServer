const express = require("express");

const router = express.Router();

const {
  createCommission,
  getCommissions,
  getCommissionById,
  updateCommission,
  updateCommissionStatus,
  deleteCommission,
} = require("../controllers/commissionController");

// Create commission
router.post("/", createCommission);

// Get all commissions
router.get("/", getCommissions);

// Get single commission
router.get("/:id", getCommissionById);

// Update complete commission
router.put("/:id", updateCommission);

// Update commission status
router.put("/:id/status", updateCommissionStatus);

// Delete commission
router.delete("/:id", deleteCommission);

module.exports = router;