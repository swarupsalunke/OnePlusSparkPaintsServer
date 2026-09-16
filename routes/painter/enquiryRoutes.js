const express = require("express");

const {
  createEnquiry,
} = require("../../controllers/painter/enquiryController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/enquiries",
  authMiddleware,
  roleMiddleware("PAINTER"),
  createEnquiry
);

module.exports = router;