const express = require("express");
const router = express.Router();

const {
    updateCollectionVerification,
} = require("../../controllers/salesExecutive/collectionController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware("SUPER_ADMIN"));

// Verify or reject a collection payment
router.patch("/:id/verification", updateCollectionVerification);

module.exports = router;