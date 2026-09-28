const express = require("express");

const {
  getPainterSchemes,
  getPainterSchemeById,
  downloadPainterSchemePdf,
} = require("../../controllers/painter/painterSchemesController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();


// Get All Painter Schemes
router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterSchemes
);


// Get Single Painter Scheme
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterSchemeById
);

router.get(
  "/:id/download",
  authMiddleware,
  roleMiddleware("PAINTER"),
  downloadPainterSchemePdf
);

module.exports = router;