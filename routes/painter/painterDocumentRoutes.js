const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const {
    getPainterDocumentCategories,
} = require("../../controllers/painter/painterDocumentController");

router.get(
    "/categories",
    authMiddleware,
    roleMiddleware("PAINTER"),
    getPainterDocumentCategories
);

module.exports = router;