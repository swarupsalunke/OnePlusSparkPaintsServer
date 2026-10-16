const express = require("express");

const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  getProductStats,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ==========================================
// CREATE PRODUCT
// ==========================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  createProduct
);

// ==========================================
// GET ALL PRODUCTS
// ==========================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT",
    "SALES_EXECUTIVE"
  ),
  getProducts
);

// ==========================================
// PRODUCT STATISTICS
// /stats MUST COME BEFORE /:id
// ==========================================

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  getProductStats
);

// ==========================================
// GET SINGLE PRODUCT
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT",
    "SALES_EXECUTIVE"
  ),
  getProductById
);

// ==========================================
// UPDATE PRODUCT
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  updateProduct
);

// ==========================================
// DELETE PRODUCT
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  deleteProduct
);


module.exports = router;