const express = require("express");

const {
  getPainterNotifications,
  getPainterNotificationById,
} = require("../../controllers/painter/painterNotificationController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterNotifications
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterNotificationById
);

module.exports = router;