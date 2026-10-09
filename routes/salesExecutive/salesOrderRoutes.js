
const express = require("express");
const router = express.Router();

const {
  getOrderProducts,
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  updateSalesOrderStatus,
} = require("../../controllers/salesExecutive/salesOrderController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware("SALES_EXECUTIVE"));

router.get("/products", getOrderProducts);
router.post("/", createSalesOrder);
router.get("/", getSalesOrders);
router.get("/:id", getSalesOrderById);
router.patch("/:id/status", updateSalesOrderStatus);

module.exports = router;
