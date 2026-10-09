const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    collectionId: {
      type: String,
      required: true,
      unique: true,
    },

    salesOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesOrder",
      required: true,
    },

    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    salesExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    invoiceAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Cheque", "UPI", "NEFT", "RTGS"],
      required: true,
    },

    transactionReference: {
      type: String,
      default: "",
      trim: true,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    receiptUrl: {
      type: String,
      default: "",
    },

    chequeImageUrl: {
      type: String,
      default: "",
    },

    paymentScreenshotUrl: {
      type: String,
      default: "",
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Partially Collected",
        "Fully Collected",
        "Verified",
        "Rejected",
      ],
      default: "Pending",
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Collection", collectionSchema);