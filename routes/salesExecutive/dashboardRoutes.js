const express = require("express");
const router = express.Router();
const { getDashboard } = require("../../controllers/salesExecutive/dashboardController");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("SALES_EXECUTIVE"), getDashboard);

module.exports = router;