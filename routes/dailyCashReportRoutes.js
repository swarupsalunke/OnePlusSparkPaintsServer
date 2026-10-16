const express = require("express");

const router = express.Router();

const {
  createDailyCashReport,
  getDailyCashReports,
  getDailyCashReportById,
  updateDailyCashReport,
  deleteDailyCashReport,
} = require("../controllers/dailyCashReportController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ==========================================
// CREATE
// ==========================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
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
// UPDATE
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
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