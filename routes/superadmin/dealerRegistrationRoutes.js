
const express = require("express");
const router = express.Router();

const {
  getDealerRegistrations,
  getDealerRegistrationById,
  reviewDealerRegistration,
} = require("../../controllers/salesExecutive/dealerRegistrationController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware("SUPER_ADMIN"));

router.get("/", getDealerRegistrations);

router.get("/:id", getDealerRegistrationById);

router.patch("/:id/review", reviewDealerRegistration);

module.exports = router;
