const express = require("express");
const router = express.Router();

const {
  createPainterRegistration,
  getPainterRegistrations,
  getPainterRegistrationById,
} = require("../../controllers/salesExecutive/painterRegistrationController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const upload = require("../../middleware/uploadMiddleware");

router.use(authMiddleware, roleMiddleware("SALES_EXECUTIVE"));

// Get Sales Executive's painter registrations
router.get("/", getPainterRegistrations);

// Get single painter registration
router.get("/:id", getPainterRegistrationById);

// Submit painter registration with documents
router.post(
  "/",
  upload.fields([
    { name: "aadhaar", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
    { name: "passbook", maxCount: 1 },
    { name: "cancelledCheque", maxCount: 1 },
  ]),
  createPainterRegistration
);

module.exports = router;