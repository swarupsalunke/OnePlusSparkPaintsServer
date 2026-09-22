const express = require("express");

const {
  getPainterOffers,
  getPainterOfferById,
} = require("../../controllers/painter/painterOffersController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterOffers
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("PAINTER"),
  getPainterOfferById
);

module.exports = router;