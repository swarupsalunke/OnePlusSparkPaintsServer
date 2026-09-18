const express = require("express");

const {
  verifyManualCode,
} = require("../../controllers/painter/manualCodeController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  verifyManualCode
);

module.exports = router;