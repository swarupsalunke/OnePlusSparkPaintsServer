const express = require("express");

const router = express.Router();

const upload = require("../../middleware/painterVoiceUploadMiddleware");

const {
    uploadVoiceVideo,
} = require("../../controllers/painter/painterVoiceVideoController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.post(
    "/voice-video",
    authMiddleware,
    roleMiddleware("PAINTER"),
    upload.single("video"),
    uploadVoiceVideo
);

module.exports = router;