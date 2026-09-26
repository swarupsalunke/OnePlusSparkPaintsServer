const express = require("express");

const {
  getPerformanceDashboard,
  getMonthlyPerformance,
  getMilestoneProgress,
} = require("../../controllers/painter/painterAnalyticsController");
const { getPainterLeaderboard } = require("../../controllers/painter/painterLeaderboardController");


const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");


const router = express.Router();

router.get(
  "/performance-dashboard",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPerformanceDashboard
);

router.get(
  "/monthly-performance",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getMonthlyPerformance
);

router.get(
  "/milestone-progress",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getMilestoneProgress
);


router.get("/leaderboard", authMiddleware, roleMiddleware("PAINTER"), getPainterLeaderboard);
module.exports = router;