const express = require("express");

const {
  scanProduct,
} = require("../../controllers/painter/scanController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/scan",
  authMiddleware,
  roleMiddleware("PAINTER"),
  scanProduct
);

module.exports = router;