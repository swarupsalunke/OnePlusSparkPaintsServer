const mongoose = require("mongoose");

const qrScanHistorySchema = new mongoose.Schema(
  {
    // Scanned QR / Barcode
    qrCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QR",
      required: true,
    },

    // Product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Dealer
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Painter
    painter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Points awarded
    pointsAwarded: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Device details
    deviceDetails: {
      type: String,
      default: "",
    },

    // GPS location
    gpsLocation: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },

    // Scan status
    scanStatus: {
      type: String,
      enum: [
        "Valid",
        "Duplicate",
        "Invalid",
        "Fraud",
      ],
      required: true,
    },

    // Scan date & time
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "QRScanHistory",
  qrScanHistorySchema
);