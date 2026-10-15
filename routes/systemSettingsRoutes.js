const express = require("express");

const {
  getSystemSettings,
  updateSystemSettings,
} = require("../controllers/systemSettingsController");

const router = express.Router();

// Get current system settings
router.get("/", getSystemSettings);

// Save / update system settings
router.put("/", updateSystemSettings);

module.exports = router;