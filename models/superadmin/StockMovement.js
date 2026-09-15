const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
  {
    // ======================================================
    // PRODUCT
    // ======================================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // ======================================================
    // WAREHOUSE
    // ======================================================

    warehouse: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ======================================================
    // MOVEMENT TYPE
    // ======================================================

    movementType: {
      type: String,
      enum: [
        "INWARD",
        "OUTWARD",
        "TRANSFER",
        "ADJUSTMENT",
      ],
      required: true,
      index: true,
    },

    // ======================================================
    // QUANTITY
    // ======================================================

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================================
    // TRANSFER DETAILS
    // ======================================================

    fromWarehouse: {
      type: String,
      default: "",
      trim: true,
    },

    toWarehouse: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================================
    // REFERENCE
    // ======================================================

    reference: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================================
    // MOVEMENT DATE
    // ======================================================

    movementDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    // ======================================================
    // USER
    // ======================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ======================================================
    // REMARKS
    // ======================================================

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "StockMovement",
  stockMovementSchema
);