const express = require("express");
const router = express.Router();

const {
  createReferral,
  getDealerReferrals,
  getReferralDetails,
} = require("../../controllers/dealer/dealerReferralController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware("DEALER"), createReferral);
router.get("/", authMiddleware, roleMiddleware("DEALER"), getDealerReferrals);
router.get("/:id", authMiddleware, roleMiddleware("DEALER"), getReferralDetails);

module.exports = router;