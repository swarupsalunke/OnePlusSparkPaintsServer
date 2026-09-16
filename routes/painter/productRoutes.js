const express = require("express");

const {
  getPainterProducts,
  getPainterProductById,
} = require("../../controllers/painter/productController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

// Get all active products for Painter
router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterProducts
);

// Get single active product for Painter
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterProductById
);

module.exports = router;