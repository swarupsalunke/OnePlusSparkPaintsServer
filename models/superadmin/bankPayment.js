const mongoose = require("mongoose");

const bankPaymentSchema = new mongoose.Schema(
  {
    beneficiaryName: {
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

    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    bankAccount: {
      type: String,
      default: "",
      trim: true,
    },

    paymentType: {
      type: String,
      default: "Reward Payment",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BankPayment", bankPaymentSchema);