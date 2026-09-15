const mongoose = require("mongoose");

const qrSchema = new mongoose.Schema(
  {
    // QR / Barcode Number
    qrCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // QR or Barcode
    qrType: {
      type: String,
      enum: ["QR", "Barcode"],
      required: true,
    },

    // Product Mapping
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Batch Number
    batchNo: {
      type: String,
      required: true,
      trim: true,
    },

    // Dealer / Shop
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

    // Reward / Points Mapping
    points: {
      type: Number,
      required: true,
      min: 0,
    },

    // QR Status
    status: {
      type: String,
      enum: [
        "Unused",
        "Used",
        "Expired",
        "Blocked",
      ],
      default: "Unused",
    },

    // Generated Date & Time
    generatedOn: {
      type: Date,
      default: Date.now,
    },

    // Expiry Date
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QR", qrSchema);