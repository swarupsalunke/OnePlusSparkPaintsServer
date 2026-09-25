const express = require("express");
const router = express.Router();

const {
  getSharePainterProfile,
} = require("../../controllers/painter/painterShareProfileController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("PAINTER"), getSharePainterProfile);

module.exports = router;