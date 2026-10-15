const mongoose = require("mongoose");

const inboundMaterialSchema = new mongoose.Schema(
  {
    grnNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    grnDate: {
      type: Date,
      default: Date.now,
    },

    // ==========================================
    // INBOUND MATERIAL DETAILS
    // ==========================================

    poDate: {
      type: Date,
    },

    vendor: {
      type: String,
      required: true,
      trim: true,
    },

    material: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    quantityOrdered: {
      type: Number,
      required: true,
      min: 0,
    },

    receivedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    eta: {
      type: Date,
    },

    lrNumber: {
      type: String,
      trim: true,
      default: "",
    },

    transport: {
      type: String,
      trim: true,
      default: "",
    },

    freight: {
      type: Number,
      default: 0,
      min: 0,
    },

    receivedDate: {
      type: Date,
    },

    warehouse: {
      type: String,
      required: true,
      trim: true,
    },

    billLocation: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================
    // CHECKS
    // ==========================================

    qualityCheck: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    quantityCheck: {
      type: String,
      enum: [
        "PENDING",
        "PASSED",
        "MISMATCH",
      ],
      default: "PENDING",
    },

    // ==========================================
    // STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "RECEIVED",
        "IN_TRANSIT",
        "PENDING_QC",
        "REJECTED",
        "CANCELLED",
      ],
      default: "IN_TRANSIT",
    },

    // ==========================================
    // VALUE
    // ==========================================

    value: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // REMARKS
    // ==========================================

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================
    // CREATED BY
    // ==========================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "InboundMaterial",
  inboundMaterialSchema
);