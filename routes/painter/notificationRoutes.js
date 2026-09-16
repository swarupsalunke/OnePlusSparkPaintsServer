const express = require("express");

const {
  getPainterNotifications,
} = require("../../controllers/painter/notificationController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

// Get notifications for logged-in Painter
router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterNotifications
);

module.exports = router;