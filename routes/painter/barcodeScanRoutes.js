const express = require("express");

const {
  verifyBarcodeScan,
} = require("../../controllers/painter/barcodeScanController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  verifyBarcodeScan
);

module.exports = router;