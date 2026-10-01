const express = require("express");
const router = express.Router();

const {
  createRedemptionRequest,
  getRedemptionHistory,
  getRedemptionById,
} = require("../../controllers/dealer/dealerRewardRedemptionController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// CREATE REDEMPTION REQUEST
router.post(
  "/",
  authMiddleware,
  roleMiddleware("DEALER"),
  createRedemptionRequest
);

// GET DEALER REDEMPTION HISTORY
router.get(
  "/",
  authMiddleware,
  roleMiddleware("DEALER"),
  getRedemptionHistory
);

// GET SINGLE REDEMPTION
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("DEALER"),
  getRedemptionById
);

module.exports = router;