const express = require("express");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

const router = express.Router();


// ==========================================
// ORDER ROUTES
// ==========================================

// Create Order
router.post("/", createOrder);

// Get All Orders
router.get("/", getOrders);

// Get Single Order
router.get("/:id", getOrderById);

// Update Order
router.put("/:id", updateOrder);

// Update Order Status
router.patch("/:id/status", updateOrderStatus);

// Delete Order
router.delete("/:id", deleteOrder);


module.exports = router;