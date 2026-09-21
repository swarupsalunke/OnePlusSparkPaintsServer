const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
    getPainterRewardDashboard,
} = require("../../controllers/painter/painterRewardDashboardController");

/* =====================================================
   GET PAINTER REWARD DASHBOARD
   ===================================================== */

router.get(
    "/",
    authMiddleware,
    getPainterRewardDashboard
);

module.exports = router;