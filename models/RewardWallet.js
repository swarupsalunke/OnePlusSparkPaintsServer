const mongoose = require("mongoose");

const rewardWalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    userType: {
      type: String,
      enum: ["DEALER", "PAINTER"],
      required: true,
    },

    currentPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    currentCashBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    lifetimeEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    redeemedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingRewards: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RewardWallet", rewardWalletSchema);