
const express = require("express");
const router = express.Router();

const salesAuthMiddleware = require("../../middleware/salesAuthMiddleware");
const uploadProfile = require("../../middleware/uploadProfile");

const {
    getSalesProfile,
    updateSalesProfile,
} = require("../../controllers/salesExecutive/salesProfileController");

router.get("/", salesAuthMiddleware, getSalesProfile);
router.put("/", salesAuthMiddleware, uploadProfile.single("profilePicture"), updateSalesProfile);

module.exports = router;
