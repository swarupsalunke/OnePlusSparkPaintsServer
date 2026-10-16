const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerMobile: {
      type: String,
      trim: true,
    },

    customerId: {
      type: String,
      trim: true,
    },

    triggerType: {
      type: String,
      enum: [
        "REWARDS_NOT_REDEEMED",
        "NO_RECENT_ORDERS",
        "LOW_QR_SCANNING",
        "REGISTRATION_PENDING",
        "PENDING_KYC",
        "PENDING_PAYMENTS",
        "INACTIVE_USERS",
      ],
      required: true,
    },

    lastActivity: {
      type: Date,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    assignedTo: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "IN_PROGRESS",
        "CLOSED",
        "OVERDUE",
      ],
      default: "PENDING",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    scheduledDate: {
      type: Date,
      default: null,
    },

    scheduledTime: {
      type: String,
      trim: true,
      default: "",
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FollowUp", followUpSchema);