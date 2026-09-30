const express = require("express");
const router = express.Router();

const {
  createDealerOrder,
  getDealerOrders,
  getDealerOrderById,
  cancelDealerOrder,
} = require("../../controllers/dealer/dealerOrderController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// CREATE ORDER FROM CART
router.post("/", authMiddleware, roleMiddleware("DEALER"), createDealerOrder);

// GET DEALER ORDERS
router.get("/", authMiddleware, roleMiddleware("DEALER"), getDealerOrders);

// GET DEALER ORDER BY ID
router.get("/:id", authMiddleware, roleMiddleware("DEALER"), getDealerOrderById);

router.put("/:id/cancel", authMiddleware, roleMiddleware("DEALER"), cancelDealerOrder);

module.exports = router;