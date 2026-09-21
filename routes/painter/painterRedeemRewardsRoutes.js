const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getPainterRedeemRewards,
  createPainterRedemptionRequest,
} = require("../../controllers/painter/painterRedeemRewardsController");

router.get(
  "/",
  authMiddleware,
  getPainterRedeemRewards
);

router.post(
  "/request",
  authMiddleware,
  createPainterRedemptionRequest
);

module.exports = router;