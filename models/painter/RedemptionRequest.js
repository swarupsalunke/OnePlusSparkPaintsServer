const mongoose = require("mongoose");

const redemptionRequestSchema = new mongoose.Schema(
  {
    painter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    requestId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    rewardType: {
      type: String,
      enum: ["POINTS", "CASH"],
      required: true,
    },

    requestedAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    payoutAccount: {
      type: String,
      required: true,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "UNDER_VERIFICATION",
        "APPROVED",
        "PROCESSED",
        "COMPLETED",
        "REJECTED",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RedemptionRequest",
  redemptionRequestSchema
);