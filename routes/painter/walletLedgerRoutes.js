const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const {
  getPainterWalletLedger,
} = require("../../controllers/painter/walletLedgerController");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterWalletLedger
);

module.exports = router;