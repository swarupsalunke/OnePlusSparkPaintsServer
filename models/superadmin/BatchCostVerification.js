const mongoose = require("mongoose");

const batchCostVerificationSchema = new mongoose.Schema(
  {
    // ======================================================
    // BATCH REFERENCE
    // ======================================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManufacturingBatch",
      required: true,
      index: true,
    },

    batchNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ======================================================
    // PRODUCTION QUANTITY
    // ======================================================

    producedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    finishedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    // ======================================================
    // COST COMPARISON
    // ======================================================

    costComparison: {
      type: Number,
      default: 0,
    },

    productCostVerification: {
      type: Number,
      default: 0,
    },

    packingWiseCost: {
      type: Number,
      default: 0,
    },

    // ======================================================
    // REMARKS
    // ======================================================

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================================
    // APPROVAL STATUS
    // ======================================================

    approvalStatus: {
      type: String,
      enum: [
        "PENDING",
        "VERIFIED",
        "REJECTED",
      ],
      default: "PENDING",
      index: true,
    },

    // ======================================================
    // VERIFICATION DETAILS
    // ======================================================

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedOn: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "BatchCostVerification",
  batchCostVerificationSchema
);