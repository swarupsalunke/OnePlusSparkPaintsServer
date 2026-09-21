const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getPainterRedemptionStatus,
} = require("../../controllers/painter/painterRedemptionStatusController");

// GET /api/painter/redemption-status/:requestId
router.get(
  "/:requestId",
  authMiddleware,
  getPainterRedemptionStatus
);

module.exports = router;