
const mongoose = require("mongoose");

const dealerRegistrationSchema = new mongoose.Schema(
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

    // Business Details
    dealerName: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
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
      required: true,
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
    district: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pinCode: {
      type: String,
      required: true,
      trim: true,
    },

    // Business Information
    gstNumber: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    panNumber: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    businessCategory: {
      type: String,
      required: true,
      trim: true,
    },
    shopType: {
      type: String,
      required: true,
      trim: true,
    },

    // KYC Documents
    gstCertificate: { type: String, default: "" },
    panCard: { type: String, default: "" },
    aadhaar: { type: String, default: "" },
    shopPhotograph: { type: String, default: "" },
    businessLicence: { type: String, default: "" },
    cancelledCheque: { type: String, default: "" },
    bankPassbook: { type: String, default: "" },

    // Location
    gpsCoordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    googleMapLocation: {
      type: String,
      default: "",
      trim: true,
    },

    // Verification and Approval
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
    dealerUser: {
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
  "DealerRegistration",
  dealerRegistrationSchema
);
