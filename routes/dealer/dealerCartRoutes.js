const express = require("express");
const router = express.Router();

const {
  getDealerCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../../controllers/dealer/dealerCartController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// GET DEALER CART
router.get("/", authMiddleware, roleMiddleware("DEALER"), getDealerCart);

// ADD PRODUCT TO CART
router.post("/add", authMiddleware, roleMiddleware("DEALER"), addToCart);

// UPDATE CART ITEM QUANTITY
router.put("/:productId", authMiddleware, roleMiddleware("DEALER"), updateCartItem);

// REMOVE PRODUCT FROM CART
router.delete("/:productId", authMiddleware, roleMiddleware("DEALER"), removeFromCart);

// CLEAR CART
router.delete("/", authMiddleware, roleMiddleware("DEALER"), clearCart);

module.exports = router;