const mongoose = require("mongoose");

const financeTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "INVOICE",
        "PAYMENT_RECEIVED",
        "OUTSTANDING",
        "PENDING_PAYMENT",
        "CREDIT_BALANCE",
        "FOLLOW_UP",
      ],
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    account: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMode: {
      type: String,
      enum: [
        "CASH",
        "BANK_TRANSFER",
        "UPI",
        "NEFT",
        "RTGS",
        "CHEQUE",
        "CARD",
        "NA",
      ],
      default: "NA",
    },

    status: {
      type: String,
      enum: [
        "PAID",
        "RECEIVED",
        "OUTSTANDING",
        "PENDING",
        "CREDIT",
        "FOLLOW_UP",
      ],
      required: true,
    },

    invoice: {
      type: String,
      default: "",
    },

    vendor: {
      type: String,
      default: "",
    },

    assignedTo: {
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
  "FinanceTransaction",
  financeTransactionSchema
);