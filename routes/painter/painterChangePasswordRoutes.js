const express = require("express");
const router = express.Router();

const {
  changePainterPassword,
} = require("../../controllers/painter/painterChangePasswordController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.put("/", authMiddleware, roleMiddleware("PAINTER"), changePainterPassword);

module.exports = router;