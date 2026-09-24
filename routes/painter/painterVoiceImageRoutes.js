const express = require("express");

const router = express.Router();

const upload = require("../../middleware/painterVoiceImageUploadMiddleware");

const {
    uploadVoiceImages,
} = require("../../controllers/painter/painterVoiceImageController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.post(
    "/voice-images",
    authMiddleware,
    roleMiddleware("PAINTER"),
    upload.array("images", 10),
    uploadVoiceImages
);

module.exports = router;