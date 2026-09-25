const express = require("express");
const router = express.Router();

const {
  getPainterAddressDetails,
  createPainterAddressDetails,
  updatePainterAddressDetails,
} = require("../../controllers/painter/painterAddressDetailsController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("PAINTER"), getPainterAddressDetails);
router.post("/", authMiddleware, roleMiddleware("PAINTER"), createPainterAddressDetails);
router.put("/", authMiddleware, roleMiddleware("PAINTER"), updatePainterAddressDetails);

module.exports = router;