
const express = require("express");
const router = express.Router();

const {
  getDashboardPreferences,
  updateDashboardPreferences,
} = require("../../controllers/superadmin/dashboardPreferenceController");

const authMiddleware = require("../../middleware/authMiddleware");

// Get Dashboard Preferences
router.get("/", authMiddleware, getDashboardPreferences);

// Update Dashboard Preferences
router.put("/", authMiddleware, updateDashboardPreferences);

module.exports = router;
