const mongoose = require("mongoose");

const dealerRewardRedemptionSchema = new mongoose.Schema(
  {
    redemptionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rewardType: {
      type: String,
      enum: ["POINTS", "CASH"],
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
        "Pending",
        "Under Verification",
        "Approved",
        "Processed",
        "Completed",
        "Rejected",
      ],
      default: "Pending",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "DealerRewardRedemption",
  dealerRewardRedemptionSchema
);