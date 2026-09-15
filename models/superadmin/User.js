const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC INFORMATION
    // =========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // ADDRESS INFORMATION
    // =========================

    addressLine1: {
      type: String,
      default: "",
      trim: true,
    },

    addressLine2: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    district: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    pinCode: {
      type: String,
      default: "",
      trim: true,
    },

    // Existing address field
    // Kept for existing project compatibility
    address: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // AUTHENTICATION
    // =========================

    password: {
      type: String,
      required: true,
    },

    // =========================
    // ROLE & REPORTING
    // =========================

    role: {
      type: String,

      enum: [
        "SUPER_ADMIN",
        "DIRECTOR",
        "MANAGER",
        "SALES_EXECUTIVE",
        "ACCOUNTANT",
        "STORE_CASHIER",
        "DEALER",
        "PAINTER",
      ],

      required: true,
    },

    reportingTo: {
      type: String,
      default: "",
      trim: true,
    },

    department: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // ACCOUNT DETAILS
    // =========================

    loginType: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,

      enum: [
        "ACTIVE",
        "INACTIVE",
        "PENDING",
        "BLOCKED",
      ],

      default: "ACTIVE",
    },

    // =========================
    // PERMISSIONS
    // =========================

    permissions: {
      type: [String],
      default: [],
    },

    // =========================
    // NOTES / REMARKS
    // =========================

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    // =========================
    // KYC INFORMATION
    // =========================

    kyc: {
      // -------------------------
      // Common KYC
      // -------------------------

      aadhaarNumber: {
        type: String,
        default: "",
      },

      aadhaarImage: {
        type: String,
        default: "",
      },

      panNumber: {
        type: String,
        default: "",
      },

      panImage: {
        type: String,
        default: "",
      },

      bankAccountNumber: {
        type: String,
        default: "",
      },

      ifscCode: {
        type: String,
        default: "",
      },

      cancelledChequeImage: {
        type: String,
        default: "",
      },

      // -------------------------
      // Dealer
      // -------------------------

      shopActLicenceNumber: {
        type: String,
        default: "",
      },

      gstNumber: {
        type: String,
        default: "",
      },

      // -------------------------
      // Sales Executive
      // -------------------------

      emergencyContact: {
        name: {
          type: String,
          default: "",
        },

        mobile: {
          type: String,
          default: "",
        },

        relation: {
          type: String,
          default: "",
        },
      },
    },

    // =========================
    // KYC STATUS
    // =========================

    kycStatus: {
      type: String,

      enum: [
        "NOT_SUBMITTED",
        "PENDING",
        "APPROVED",
        "REJECTED",
        "CORRECTION_REQUIRED",
      ],

      default: "NOT_SUBMITTED",
    },

    kycRemarks: {
      type: String,
      default: "",
    },

    // =========================
    // VERIFICATION
    // =========================

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    // =========================
    // LOGIN INFORMATION
    // =========================

    lastLogin: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);