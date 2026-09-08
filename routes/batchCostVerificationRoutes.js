const express = require("express");

const router = express.Router();

const {
  createCostVerification,
  getCostVerification,
  updateCostVerification,
  verifyCost,
  rejectCost,
} = require("../controllers/batchCostVerificationController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ======================================================
// BATCH COST VERIFICATION
// ======================================================

// GET COST VERIFICATION BY BATCH
router.get(
  "/:batchId",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getCostVerification
);

// CREATE COST VERIFICATION
router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  createCostVerification
);

// UPDATE COST VERIFICATION
router.put(
  "/:batchId",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  updateCostVerification
);

// VERIFY COST
router.put(
  "/:batchId/verify",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "ACCOUNTANT"
  ),
  verifyCost
);

// REJECT COST
router.put(
  "/:batchId/reject",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "ACCOUNTANT"
  ),
  rejectCost
);

module.exports = router;