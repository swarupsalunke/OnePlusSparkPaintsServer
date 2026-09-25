const mongoose = require("mongoose");

const painterBankDetailsSchema = new mongoose.Schema(
  {
    painterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    accountHolder: {
      type: String,
      required: true,
      trim: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    ifsc: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    verificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PainterBankDetails",
  painterBankDetailsSchema
);