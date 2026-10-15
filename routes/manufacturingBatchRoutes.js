const express = require("express");

const router = express.Router();

const {
  getBatchStats,
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  closeBatch,
  updateBatchQC,
  deleteBatch,
} = require("../controllers/manufacturingBatchController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ======================================================
// MANUFACTURING BATCH MANAGEMENT
// ======================================================

// GET BATCH STATISTICS
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getBatchStats
);

// GET ALL BATCHES
router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getBatches
);

// GET SINGLE BATCH
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getBatchById
);

// CREATE BATCH
router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  createBatch
);

// UPDATE BATCH
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  updateBatch
);

// CLOSE BATCH
router.put(
  "/:id/close",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  closeBatch
);

// UPDATE LAB QUALITY CONTROL
router.put(
  "/:id/qc",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  updateBatchQC
);

// DELETE BATCH
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  deleteBatch
);

module.exports = router;