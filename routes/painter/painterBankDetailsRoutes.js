const express = require("express");

const router = express.Router();

const {
  getPainterBankDetails,
  createPainterBankDetails,
   updatePainterBankDetails,
} = require("../../controllers/painter/painterBankDetailsController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("PAINTER"), getPainterBankDetails);
router.post("/", authMiddleware, roleMiddleware("PAINTER"), createPainterBankDetails);
router.put("/", authMiddleware, roleMiddleware("PAINTER"), updatePainterBankDetails);

module.exports = router;