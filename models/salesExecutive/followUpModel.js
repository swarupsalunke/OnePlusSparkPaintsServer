const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    salesExecutiveId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    customerType: {
      type: String,
      enum: ["Dealer", "Painter", "Lead"],
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    reason: {
      type: String,
      enum: [
        "Order",
        "Payment",
        "Product",
        "Registration",
        "Complaint",
        "Other",
      ],
      required: true,
    },

    followUpDate: {
      type: String,
      required: true,
    },

    followUpTime: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "Rescheduled"],
      default: "Pending",
    },

    nextFollowUpDate: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.SalesExecutiveFollowUp || mongoose.model("SalesExecutiveFollowUp", followUpSchema);
