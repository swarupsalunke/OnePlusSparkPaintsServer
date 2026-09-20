const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const {
  getPainterRewardHistory,
} = require("../../controllers/painter/rewardHistoryController");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterRewardHistory
);

module.exports = router;