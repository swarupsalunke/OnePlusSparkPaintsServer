const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getPainterSchemePerformance,
} = require("../../controllers/painter/painterSchemePerformanceController");

// GET /api/painter/scheme-performance
router.get(
  "/",
  authMiddleware,
  getPainterSchemePerformance
);

module.exports = router;