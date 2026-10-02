const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const {
  getDealerPaymentOutstanding,
} = require("../../controllers/dealer/dealerPaymentOutstandingController");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("DEALER"),
  getDealerPaymentOutstanding
);

module.exports = router;