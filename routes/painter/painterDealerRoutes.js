const express = require("express");
const router = express.Router();

const {
    getPainterDealers,
} = require("../../controllers/painter/painterDealerController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.get(
    "/dealers",
    authMiddleware,
    roleMiddleware("PAINTER"),
    getPainterDealers
);

module.exports = router;