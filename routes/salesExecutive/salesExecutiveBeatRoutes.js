const express = require("express");
const router = express.Router();

const {
  getMyVisits,
} = require("../../controllers/salesExecutive/salesExecutiveBeatController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.get(
  "/my-visits",
  authMiddleware,
  roleMiddleware("SALES_EXECUTIVE"),
  getMyVisits
);

module.exports = router;