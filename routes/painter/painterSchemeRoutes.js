const express = require("express");

const {
  getPainterSchemes,
} = require("../../controllers/painter/painterSchemeController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterSchemes
);

module.exports = router;