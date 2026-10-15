const express = require("express");

const router = express.Router();

const {
  getStockMovements,
  createInward,
  createOutward,
  createTransfer,
  createAdjustment,
} = require("../controllers/stockMovementController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// GET STOCK MOVEMENTS
router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getStockMovements
);

// INWARD MATERIAL
router.post(
  "/inward",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  createInward
);

// OUTWARD MATERIAL
router.post(
  "/outward",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  createOutward
);

// STOCK TRANSFER
router.post(
  "/transfer",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  createTransfer
);

// STOCK ADJUSTMENT
router.post(
  "/adjustment",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  createAdjustment
);

module.exports = router;