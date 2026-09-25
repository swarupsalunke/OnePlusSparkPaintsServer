const express = require("express");

const router = express.Router();

const {
  editPainterProfile,
} = require("../../controllers/painter/painterEditProfileController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.put(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  editPainterProfile
);

module.exports = router;