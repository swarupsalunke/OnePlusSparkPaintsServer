const express = require("express");
const router = express.Router();

const {
  getPainterProfilePreview,
} = require("../../controllers/painter/painterProfilePreviewController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("PAINTER"), getPainterProfilePreview);

module.exports = router;