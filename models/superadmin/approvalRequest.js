const mongoose = require("mongoose");

const approvalRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    moduleType: {
      type: String,
      enum: [
        "Reward Point Release",
        "Cash Reward Release",
        "Price Changes",
        "Bulk Payment Processing",
        "Dealer Registration Approval",
        "KYC Approval",
        "Product Price Revision",
        "Scheme Approval",
      ],
      required: true,
    },

    requestType: {
      type: String,
      default: "",
      trim: true,
    },

    requestDetails: {
      type: String,
      default: "",
      trim: true,
    },

    requestedBy: {
      type: String,
      required: true,
      trim: true,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    currentStage: {
      type: String,
      enum: [
        "Maker Approval",
        "Checker Approval",
        "Completed",
      ],
      default: "Maker Approval",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },

    maker: {
      type: String,
      default: "",
      trim: true,
    },

    checker: {
      type: String,
      default: "",
      trim: true,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    auditTrail: [
      {
        action: {
          type: String,
          required: true,
          trim: true,
        },

        performedBy: {
          type: String,
          required: true,
          trim: true,
        },

        performedAt: {
          type: Date,
          default: Date.now,
        },

        remarks: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ApprovalRequest",
  approvalRequestSchema
);