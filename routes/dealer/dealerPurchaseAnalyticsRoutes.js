const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const {
  getDealerPurchaseAnalytics,
} = require("../../controllers/dealer/dealerPurchaseAnalyticsController");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("DEALER"),
  getDealerPurchaseAnalytics
);

module.exports = router;