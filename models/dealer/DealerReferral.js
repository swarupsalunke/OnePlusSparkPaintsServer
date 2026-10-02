const mongoose = require("mongoose");

const dealerReferralSchema = new mongoose.Schema(
  {
    referralId: {
      type: String,
      unique: true,
      required: true,
    },

    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Dealer",
        "Painter",
        "Builder",
        "Contractor",
        "Engineer",
        "Architect",
        "Retailer",
        "Interior Designer",
        "Other",
      ],
      required: true,
    },

    referredName: {
      type: String,
      required: true,
      trim: true,
    },

    referredMobile: {
      type: String,
      required: true,
      trim: true,
    },

    referredEmail: {
      type: String,
      default: "",
      trim: true,
    },

    referralCode: {
      type: String,
      unique: true,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "REGISTERED",
        "VERIFIED",
        "REWARD_CREDITED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    rewardPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    rewardStatus: {
      type: String,
      enum: ["PENDING", "CREDITED", "NOT_ELIGIBLE"],
      default: "PENDING",
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DealerReferral", dealerReferralSchema);