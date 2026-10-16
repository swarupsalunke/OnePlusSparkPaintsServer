const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER
    // =====================================================

    user: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // USER TYPE
    // =====================================================

    userType: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // BRANCH
    // =====================================================

    branch: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // TERRITORY
    // =====================================================

    territory: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // SCHEME / SOURCE
    // =====================================================

    schemeSource: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // SALES AMOUNT
    // =====================================================

    salesAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // =====================================================
    // REWARD POINTS
    // =====================================================

    rewardPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // CASH REWARD
    // =====================================================

    cashReward: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // COMMISSION %
    // =====================================================

    commissionPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // PENALTY
    // =====================================================

    penalty: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // NET PAYABLE
    // =====================================================

    netPayable: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // STATUS
    // =====================================================

    status: {
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

    // =====================================================
    // PAYMENT DATE
    // =====================================================

    paymentDate: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Commission", commissionSchema);