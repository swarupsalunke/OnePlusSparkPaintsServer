const express = require("express");

const {
  createQR,
  getAllQR,
  getQRById,
  updateQR,
  deleteQR,
  scanQR,
  getScanHistory,
} = require("../controllers/qrController");

const router = express.Router();

// Create QR / Barcode
router.post("/", createQR);

// Get all QR / Barcode
router.get("/", getAllQR);

// Get scan history
router.get("/scan-history", getScanHistory);

// Scan QR / Barcode
router.post("/scan", scanQR);

// Get single QR / Barcode
router.get("/:id", getQRById);

// Update QR / Barcode
router.put("/:id", updateQR);

// Delete QR / Barcode
router.delete("/:id", deleteQR);


module.exports = router;