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

// =====================================================
// CREATE COMMISSION
// =====================================================

router.post("/", createCommission);

// =====================================================
// GET ALL COMMISSIONS
// =====================================================

router.get("/", getCommissions);

// =====================================================
// GET COMMISSION BY ID
// =====================================================

router.get("/:id", getCommissionById);

// =====================================================
// UPDATE COMPLETE COMMISSION
// =====================================================

router.put("/:id", updateCommission);

// =====================================================
// UPDATE COMMISSION STATUS
// =====================================================

router.put("/:id/status", updateCommissionStatus);

// =====================================================
// DELETE COMMISSION
// =====================================================

router.delete("/:id", deleteCommission);

module.exports = router;