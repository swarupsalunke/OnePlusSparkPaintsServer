const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const {
    getPainterProducts,
    getPainterProductById,
} = require("../../controllers/painter/painterProductController");

// GET ALL PAINTER PRODUCTS
router.get(
    "/",
    authMiddleware,
    roleMiddleware("PAINTER"),
    getPainterProducts
);

// GET SINGLE PAINTER PRODUCT
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("PAINTER"),
    getPainterProductById
);

module.exports = router;