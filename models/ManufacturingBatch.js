const mongoose = require("mongoose");


const packingDetailSchema = new mongoose.Schema(
  {
    packingSize: {
      type: String,
      enum: ["20 Ltr", "10 Ltr", "4 Ltr", "1 Ltr"],
      required: true,
    },

    plannedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    producedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    labelVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

// ======================================================
// LAB QUALITY CONTROL SCHEMA
// ======================================================

const labQualityControlSchema = new mongoose.Schema(
  {
    captureDateTime: {
      type: Date,
      default: null,
    },

    wetPerLitre: {
      type: Number,
      default: null,
      min: 0,
    },

    temperature: {
      type: Number,
      default: null,
    },

    viscosity: {
      type: Number,
      default: null,
      min: 0,
    },

    drawDownResult: {
      type: String,
      default: "",
      trim: true,
    },

    hegmanFineness: {
      type: Number,
      default: null,
      min: 0,
    },

    labReport: {
      type: String,
      default: "",
      trim: true,
    },

    qcRemarks: {
      type: String,
      default: "",
      trim: true,
    },

    qcStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    _id: false,
  }
);

// ======================================================
// MANUFACTURING BATCH SCHEMA
// ======================================================

const manufacturingBatchSchema = new mongoose.Schema(
  {

    batchNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    batchDate: {
      type: Date,
      required: true,
    },

    batchName: {
      type: String,
      required: true,
      trim: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    plantUnit: {
      type: String,
      required: true,
      trim: true,
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    batchStartTime: {
      type: Date,
      default: null,
    },

    batchEndTime: {
      type: Date,
      default: null,
    },

    batchQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    batchSize: {
      type: String,
      enum: [
        "20kg",
        "200kg",
        "600kg",
        "1200kg",
        "CUSTOM",
      ],
      required: true,
    },

    customBatchSize: {
      type: Number,
      default: null,
      min: 0,
    },

    numberOfOperators: {
      type: Number,
      required: true,
      min: 0,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // BATCH STATUS
    // ==================================================

    status: {
      type: String,
      enum: [
        "PLANNED",
        "IN_PRODUCTION",
        "QC_PENDING",
        "COMPLETED",
        "REJECTED",
      ],
      default: "PLANNED",
      index: true,
    },

    // ==================================================
    // PACKING DETAILS
    // ==================================================

    packingDetails: {
      type: [packingDetailSchema],
      default: [],
    },

    // ==================================================
    // LABEL VERIFICATION
    // ==================================================

    labelVerification: {
      type: Boolean,
      default: false,
    },

    // ==================================================
    // LAB QUALITY CONTROL
    // ==================================================

    labQualityControl: {
      type: labQualityControlSchema,
      default: () => ({}),
    },

    // ==================================================
    // BATCH CLOSE DETAILS
    // ==================================================

    closedOn: {
      type: Date,
      default: null,
    },

    closedBy: {
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
  "ManufacturingBatch",
  manufacturingBatchSchema
);