const express = require("express");
const router = express.Router();

const {
  getDealerProfile,
  createOrUpdateDealerProfile,
  updateBankDetails,
  updateProfilePicture,
  updateNotificationPreferences,
  changeDealerPassword,
} = require("../../controllers/dealer/dealerProfileController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const dealerProfileUpload = require("../../middleware/dealerProfileUpload");

router.get("/", authMiddleware, roleMiddleware("DEALER"), getDealerProfile);

router.put("/", authMiddleware, roleMiddleware("DEALER"), createOrUpdateDealerProfile);

router.put("/bank-details", authMiddleware, roleMiddleware("DEALER"), updateBankDetails);

router.put("/profile-picture", authMiddleware, roleMiddleware("DEALER"), dealerProfileUpload.single("profilePicture"), updateProfilePicture);

router.put("/notification-preferences", authMiddleware, roleMiddleware("DEALER"), updateNotificationPreferences);

router.put("/change-password", authMiddleware, roleMiddleware("DEALER"), changeDealerPassword);

module.exports = router;