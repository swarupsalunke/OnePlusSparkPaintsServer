const mongoose = require("mongoose");

const inventoryStockSchema = new mongoose.Schema(
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
    // CATEGORY / GROUP
    // ======================================================

    category: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    group: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // ======================================================
    // STOCK
    // ======================================================

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================================
    // REORDER / STOCK LEVEL
    // ======================================================

    reorderLevel: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ======================================================
    // STOCK DATES
    // ======================================================

    lastMovementDate: {
      type: Date,
      default: null,
    },

    lastReceivedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "InventoryStock",
  inventoryStockSchema
);