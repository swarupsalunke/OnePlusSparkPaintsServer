const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getPainterRewardWallet,
} = require("../../controllers/painter/painterRewardWalletController");

// GET /api/painter/reward-wallet
router.get(
  "/",
  authMiddleware,
  getPainterRewardWallet
);

module.exports = router;