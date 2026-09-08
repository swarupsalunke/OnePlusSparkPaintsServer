const express = require("express");

const {
  getBankPaymentDashboard,
  getBeneficiaries,
  getBeneficiaryById,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  generatePaymentSheet,
} = require("../controllers/bankPaymentController");

const router = express.Router();

// Dashboard
router.get("/dashboard", getBankPaymentDashboard);

// Beneficiary routes
router.get("/", getBeneficiaries);
router.post("/", createBeneficiary);

// Generate payment sheet
router.post("/generate", generatePaymentSheet);

// Beneficiary ID routes — ALWAYS LAST
router.get("/:id", getBeneficiaryById);
router.put("/:id", updateBeneficiary);
router.delete("/:id", deleteBeneficiary);

module.exports = router;