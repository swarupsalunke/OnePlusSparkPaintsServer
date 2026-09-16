const express = require("express");

const {
  getPainterRewards,
} = require("../../controllers/painter/rewardController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

// Get Quick Rewards for logged-in Painter
router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterRewards
);

module.exports = router;