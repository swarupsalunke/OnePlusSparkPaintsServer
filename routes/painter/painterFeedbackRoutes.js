const express = require("express");
const router = express.Router();

const {
    createPainterFeedback,
    getPainterComplaints,
} = require("../../controllers/painter/painterFeedbackController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const upload = require("../../middleware/painterFeedbackUploadMiddleware");

router.post(
    "/feedback",
    authMiddleware,
    roleMiddleware("PAINTER"),
    upload.array("attachments", 10),
    createPainterFeedback
);
router.get(
    "/complaints",
    authMiddleware,
    roleMiddleware("PAINTER"),
    getPainterComplaints
);

module.exports = router;