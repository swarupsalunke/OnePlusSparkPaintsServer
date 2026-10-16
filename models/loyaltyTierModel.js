const mongoose = require("mongoose");

const loyaltyTierSchema = new mongoose.Schema(
  {
    tierName: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: Number,
      required: true,
      min: 1,
    },

    tierType: {
      type: String,
      default: "STANDARD",
      trim: true,
    },

    applicableTo: {
      type: [String],
      default: ["DEALER", "PAINTER", "RETAILER"],
    },

    minPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },

    rewardPointsMultiplier: {
      type: Number,
      default: 1,
      min: 0,
    },

    cashbackPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    benefits: {
      higherRewardPoints: {
        type: Boolean,
        default: false,
      },

      exclusiveSchemes: {
        type: Boolean,
        default: false,
      },

      cashbackOffers: {
        type: Boolean,
        default: false,
      },

      earlyProductLaunchAccess: {
        type: Boolean,
        default: false,
      },

      premiumSupport: {
        type: Boolean,
        default: false,
      },

      birthdaySpecialPoints: {
        type: Number,
        default: 0,
        min: 0,
      },

      anniversaryBonus: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    qualificationRules: {
      minAnnualPurchase: {
        type: Number,
        default: 0,
        min: 0,
      },

      otherConditions: {
        type: String,
        default: "",
        trim: true,
      },
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    effectiveFrom: {
      type: Date,
    },

    effectiveTo: {
      type: Date,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LoyaltyTier", loyaltyTierSchema);