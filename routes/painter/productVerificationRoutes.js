const express = require("express");

const {
  getProductVerification,
} = require("../../controllers/painter/productVerificationController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/:scanCode",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getProductVerification
);

module.exports = router;