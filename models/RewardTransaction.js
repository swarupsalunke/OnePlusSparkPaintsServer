const mongoose = require("mongoose");

const rewardTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userType: {
      type: String,
      enum: ["DEALER", "PAINTER"],
      required: true,
    },

    rewardType: {
      type: String,
      enum: ["POINTS", "CASH"],
      required: true,
    },

    transactionType: {
      type: String,
      enum: [
        "ADD",
        "DEDUCT",
        "APPROVE",
        "RELEASE",
        "REVERSE",
      ],
      required: true,
    },

    points: {
      type: Number,
      default: 0,
      min: 0,
    },

    cashAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "RELEASED",
        "REVERSED",
        "COMPLETED",
      ],
      default: "PENDING",
    },

    description: {
      type: String,
      trim: true,
    },

    reference: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RewardTransaction",
  rewardTransactionSchema
);