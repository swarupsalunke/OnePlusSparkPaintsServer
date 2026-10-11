const express = require("express");
const router = express.Router();

const { getPainterList } = require("../../controllers/salesExecutive/painterListController");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("SALES_EXECUTIVE"), getPainterList);

module.exports = router;