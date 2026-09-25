const express = require("express");

const router = express.Router();

const {
  getMyProfile,
  createPainterProfile,
} = require("../../controllers/painter/painterProfileController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getMyProfile
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  createPainterProfile
);

module.exports = router;