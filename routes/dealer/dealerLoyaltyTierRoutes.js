const express = require("express");

const router = express.Router();

const {
  getDealerLoyaltyTier,
} = require("../../controllers/dealer/dealerLoyaltyTierController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("DEALER"), getDealerLoyaltyTier);

module.exports = router;