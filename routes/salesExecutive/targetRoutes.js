
const express = require("express");
const router = express.Router();

const {
  assignTarget,
  getMyTargetDashboard,
  getTargets,
  getTargetLeaderboard,
} = require("../../controllers/salesExecutive/targetController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.use(authMiddleware);

// Sales Executive dashboard
router.get(
  "/dashboard",
  roleMiddleware("SALES_EXECUTIVE"),
  getMyTargetDashboard
);

// Monthly leaderboard
router.get(
  "/leaderboard",
  roleMiddleware("SALES_EXECUTIVE"),
  getTargetLeaderboard
);

// Target assignment: authorized roles are checked in the controller
router.post("/", assignTarget);

// Sales Executive sees own targets; authorized management roles can see all
router.get("/", getTargets);

module.exports = router;
