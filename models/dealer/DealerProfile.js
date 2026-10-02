const mongoose = require("mongoose");

const dealerProfileSchema = new mongoose.Schema(
  {
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    dealerName: {
      type: String,
      default: "",
      trim: true,
    },

    businessName: {
      type: String,
      default: "",
      trim: true,
    },

    mobileNumber: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    gstNumber: {
      type: String,
      default: "",
      trim: true,
    },

    panNumber: {
      type: String,
      default: "",
      trim: true,
    },

    shopActNumber: {
      type: String,
      default: "",
      trim: true,
    },

    registrationDate: {
      type: Date,
      default: null,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    businessAddress: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    district: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    pinCode: {
      type: String,
      default: "",
      trim: true,
    },

    bankDetails: {
      bankName: {
        type: String,
        default: "",
        trim: true,
      },
      accountHolder: {
        type: String,
        default: "",
        trim: true,
      },
      accountNumber: {
        type: String,
        default: "",
        trim: true,
      },
      ifsc: {
        type: String,
        default: "",
        trim: true,
      },
    },

    notificationPreferences: {
      orderUpdates: {
        type: Boolean,
        default: true,
      },
      paymentUpdates: {
        type: Boolean,
        default: true,
      },
      rewardUpdates: {
        type: Boolean,
        default: true,
      },
      promotionalCampaigns: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DealerProfile", dealerProfileSchema);