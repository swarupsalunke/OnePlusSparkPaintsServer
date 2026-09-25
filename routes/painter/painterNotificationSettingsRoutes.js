const express = require("express");
const router = express.Router();

const {
  getNotificationSettings,
  updateNotificationSettings,
} = require("../../controllers/painter/painterNotificationSettingsController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("PAINTER"), getNotificationSettings);
router.put("/", authMiddleware, roleMiddleware("PAINTER"), updateNotificationSettings);

module.exports = router;