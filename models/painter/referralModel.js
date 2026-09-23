const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    referralCode: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    referredName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "PAINTER",
        "DEALER",
        "CONTRACTOR",
        "ENGINEER",
        "ARCHITECT",
        "BUILDER",
        "INTERIOR_DESIGNER",
        "OTHER",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "CONVERTED", "REJECTED"],
      default: "PENDING",
    },

    reward: {
      type: Number,
      default: 0,
      min: 0,
    },

    referralShared: {
      type: Boolean,
      default: false,
    },

    registrationCompleted: {
      type: Boolean,
      default: false,
    },

    verificationApproved: {
      type: Boolean,
      default: false,
    },

    eligibleActivity: {
      type: Boolean,
      default: false,
    },

    rewardCredited: {
      type: Boolean,
      default: false,
    },

    sharedAt: {
      type: Date,
      default: null,
    },

    registrationCompletedAt: {
      type: Date,
      default: null,
    },

    verificationApprovedAt: {
      type: Date,
      default: null,
    },

    eligibleActivityAt: {
      type: Date,
      default: null,
    },

    rewardCreditedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Referral", referralSchema);