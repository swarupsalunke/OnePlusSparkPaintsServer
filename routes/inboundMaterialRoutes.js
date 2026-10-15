const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  createInbound,
  getInbounds,
  getInboundById,
  updateInbound,
  updateInboundStatus,
  updateQualityCheck,
  updateQuantityCheck,
  deleteInbound,
  getInboundStats,
  getInboundOverview,
  getInboundSummary,
  getInboundAlerts,
  getMonthlyInboundStats,
} = require("../controllers/inboundMaterialController");

const router = express.Router();

// ======================================================
// DASHBOARD
// ======================================================

router.get(
  "/stats",
  authMiddleware,
  getInboundStats
);

router.get(
  "/overview",
  authMiddleware,
  getInboundOverview
);

router.get(
  "/summary",
  authMiddleware,
  getInboundSummary
);

router.get(
  "/alerts",
  authMiddleware,
  getInboundAlerts
);

router.get(
  "/monthly-stats",
  authMiddleware,
  getMonthlyInboundStats
);

// ======================================================
// CREATE INBOUND / GRN
// ======================================================

router.post(
  "/",
  authMiddleware,
  createInbound
);

// ======================================================
// GET ALL INBOUND / GRNs
// ======================================================

router.get(
  "/",
  authMiddleware,
  getInbounds
);

// ======================================================
// GET SINGLE INBOUND
// ======================================================

router.get(
  "/:id",
  authMiddleware,
  getInboundById
);

// ======================================================
// UPDATE INBOUND
// ======================================================

router.put(
  "/:id",
  authMiddleware,
  updateInbound
);

// ======================================================
// UPDATE STATUS
// ======================================================

router.patch(
  "/:id/status",
  authMiddleware,
  updateInboundStatus
);

// ======================================================
// UPDATE QUALITY CHECK
// ======================================================

router.patch(
  "/:id/quality-check",
  authMiddleware,
  updateQualityCheck
);

// ======================================================
// UPDATE QUANTITY CHECK
// ======================================================

router.patch(
  "/:id/quantity-check",
  authMiddleware,
  updateQuantityCheck
);

// ======================================================
// DELETE INBOUND
// ======================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteInbound
);

module.exports = router;