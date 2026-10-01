const express = require("express");

const {
  getDealerPainterEnquiries,
  updateDealerPainterEnquiryStatus,
} = require("../../controllers/dealer/dealerPainterEnquiryController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("DEALER"),
  getDealerPainterEnquiries
);

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("DEALER"),
  updateDealerPainterEnquiryStatus
);

module.exports = router;