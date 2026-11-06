const express = require("express");

const router = express.Router();

const {
  createDailyCashReport,
  getDailyCashReports,
  getDailyCashReportById,
  updateDailyCashReport,
  deleteDailyCashReport,
  approveDailyCashReport,
  rejectDailyCashReport,
  approveOpeningBalance,
  rejectOpeningBalance,
} = require("../../controllers/superadmin/dailyCashReportController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// ==========================================
// CREATE
// ==========================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "DIRECTOR", "MANAGER"),
  createDailyCashReport
);

// ==========================================
// GET ALL
// ==========================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getDailyCashReports
);

// ==========================================
// GET SINGLE
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getDailyCashReportById
);

// ==========================================
// APPROVE REPORT
// ==========================================

router.post(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "DIRECTOR"),
  approveDailyCashReport
);

// ==========================================
// REJECT REPORT
// ==========================================

router.post(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "DIRECTOR"),
  rejectDailyCashReport
);

// OPENING CASH APPROVAL

router.post(
  "/:id/opening-balance/approve",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "DIRECTOR"),
  approveOpeningBalance
);

router.post(
  "/:id/opening-balance/reject",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "DIRECTOR"),
  rejectOpeningBalance
);

// ==========================================
// UPDATE
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "DIRECTOR", "MANAGER"),
  updateDailyCashReport
);

// ==========================================
// DELETE
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  deleteDailyCashReport
);

module.exports = router;