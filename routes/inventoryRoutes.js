const express = require("express");

const router = express.Router();

const {
  getInventoryStats,
  getInventoryStocks,
  getCategoryStock,
  getGroupStock,
  getWarehouseStock,
  getStockMovements,
  getStockSummary,
  getStockQuery,
  getLowStock,
  getReorderLevel,
  getDeadStock,
  getStockAgeing,
  getInventoryOverview,
  syncInventoryProductData,
  getTopConsumedItems,
  updateStockMovement,
  deleteStockMovement,
} = require("../controllers/inventoryController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ======================================================
// INVENTORY MANAGEMENT & STOCK ANALYTICS
// ======================================================

// INVENTORY STATS
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getInventoryStats
);

// INVENTORY OVERVIEW
router.get(
  "/overview",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getInventoryOverview
);

// STOCK LISTING
router.get(
  "/stock",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getInventoryStocks
);

// CATEGORY-WISE STOCK
router.get(
  "/category-stock",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getCategoryStock
);

// GROUP-WISE STOCK
router.get(
  "/group-stock",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getGroupStock
);

// WAREHOUSE STOCK
router.get(
  "/warehouse-stock",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getWarehouseStock
);

// STOCK MOVEMENTS
router.get(
  "/movements",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getStockMovements
);

// STOCK SUMMARY
router.get(
  "/summary",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getStockSummary
);

// STOCK QUERY
router.get(
  "/query",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getStockQuery
);

// LOW STOCK ALERTS
router.get(
  "/low-stock",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getLowStock
);

// REORDER LEVEL
router.get(
  "/reorder-level",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getReorderLevel
);

// DEAD STOCK
router.get(
  "/dead-stock",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getDeadStock
);

// STOCK AGEING
router.get(
  "/stock-ageing",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getStockAgeing
);

router.put(
  "/sync-product-data",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  syncInventoryProductData
);

router.get(
  "/top-consumed",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT"
  ),
  getTopConsumedItems
);

router.put(
  "/movements/:id",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  updateStockMovement
);

router.delete(
  "/movements/:id",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  deleteStockMovement
);

module.exports = router;