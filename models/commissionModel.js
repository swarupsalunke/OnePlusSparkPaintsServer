const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    customer: {
      type: String,
      required: true,
      trim: true,
    },

    store: {
      type: String,
      required: true,
      trim: true,
    },

    salesExecutive: {
      type: String,
      required: true,
      trim: true,
    },

    territory: {
      type: String,
      default: "",
      trim: true,
    },

    saleDate: {
      type: Date,
      required: true,
    },

    invoiceValue: {
      type: Number,
      required: true,
      min: 0,
    },

    saleType: {
      type: String,
      enum: ["CASH", "CREDIT"],
      required: true,
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    recoveryDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    rewardPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    commissionPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    commissionAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    penaltyAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    netCommission: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "DELAYED"],
      default: "PENDING",
    },

    commissionStatus: {
      type: String,
      enum: [
        "PENDING_CALCULATION",
        "UNDER_VERIFICATION",
        "APPROVED",
        "RELEASED",
        "ON_HOLD",
        "CANCELLED",
      ],
      default: "PENDING_CALCULATION",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Commission", commissionSchema);