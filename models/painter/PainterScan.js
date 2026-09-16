const mongoose = require("mongoose");

const painterScanSchema = new mongoose.Schema(
  {
    painter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    scanCode: {
      type: String,
      required: true,
      trim: true,
    },

    scanType: {
      type: String,
      enum: ["QR", "BARCODE", "MANUAL"],
      required: true,
    },

    scanStatus: {
      type: String,
      enum: ["VALID", "INVALID", "DUPLICATE"],
      default: "VALID",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PainterScan", painterScanSchema);