const mongoose = require("mongoose");

const dealerComplaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      required: true,
    },
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    complaintType: {
      type: String,
      enum: ["PRODUCT", "SERVICE", "DELIVERY", "PAYMENT"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    documents: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      default: "SUBMITTED",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DealerComplaint", dealerComplaintSchema);