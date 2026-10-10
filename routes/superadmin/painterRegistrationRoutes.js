const express = require("express");
const router = express.Router();

const {
  getPainterRegistrations,
  getPainterRegistrationById,
  reviewPainterRegistration,
} = require("../../controllers/salesExecutive/painterRegistrationController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware("SUPER_ADMIN"));

// Get all painter registrations
router.get("/", getPainterRegistrations);

// Get single painter registration details
router.get("/:id", getPainterRegistrationById);

// Verify KYC, approve, reject or request correction
router.patch("/:id/review", reviewPainterRegistration);

module.exports = router;