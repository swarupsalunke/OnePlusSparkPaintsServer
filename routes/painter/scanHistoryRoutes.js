const express = require("express");

const {
  getPainterScanHistory,
} = require("../../controllers/painter/scanHistoryController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterScanHistory
);

module.exports = router;