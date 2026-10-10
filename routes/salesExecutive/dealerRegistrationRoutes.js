
const express = require("express");
const router = express.Router();

const {
  createDealerRegistration,
  getDealerRegistrations,
} = require("../../controllers/salesExecutive/dealerRegistrationController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const upload = require("../../middleware/uploadMiddleware");

router.use(authMiddleware, roleMiddleware("SALES_EXECUTIVE"));

router.get("/", getDealerRegistrations);

router.post(
  "/",
  upload.fields([
    { name: "gstCertificate", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "aadhaar", maxCount: 1 },
    { name: "shopPhotograph", maxCount: 1 },
    { name: "businessLicence", maxCount: 1 },
    { name: "cancelledCheque", maxCount: 1 },
    { name: "bankPassbook", maxCount: 1 },
  ]),
  createDealerRegistration
);

module.exports = router;
