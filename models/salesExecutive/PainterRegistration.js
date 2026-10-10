const mongoose = require("mongoose");

const painterRegistrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      unique: true,
      trim: true,
    },

    salesExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Painter Details
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    serviceableArea: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    // KYC Documents
    aadhaar: {
      type: String,
      required: true,
    },
    panCard: {
      type: String,
      default: "",
    },
    bankAccountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    profilePhoto: {
      type: String,
      required: true,
    },
    passbook: {
      type: String,
      default: "",
    },
    cancelledCheque: {
      type: String,
      default: "",
    },

    // KYC Verification and Approval
    status: {
      type: String,
      enum: [
        "PENDING",
        "KYC_VERIFIED",
        "APPROVED",
        "REJECTED",
        "CORRECTION_REQUIRED",
      ],
      default: "PENDING",
    },
    adminRemarks: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    painterUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PainterRegistration",
  painterRegistrationSchema
);