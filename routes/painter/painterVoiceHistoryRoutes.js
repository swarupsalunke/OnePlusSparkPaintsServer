const express = require("express");
const router = express.Router();

const {
    getPainterVoiceHistory,
} = require("../../controllers/painter/painterVoiceHistoryController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.get(
    "/voice-history",
    authMiddleware,
    roleMiddleware("PAINTER"),
    getPainterVoiceHistory
);

module.exports = router;