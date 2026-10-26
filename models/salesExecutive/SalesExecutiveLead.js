const mongoose = require("mongoose");

const salesExecutiveLeadSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    contactDetails: {
      type: String,
      required: true,
      trim: true,
    },
    businessType: {
      type: String,
      required: true,
      enum: ["Dealer", "Painter", "Channel Partner", "End User"],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    pinCode: {
      type: String,
      trim: true,
      default: "",
    },
    productInterest: {
      type: String,
      required: true,
      trim: true,
    },
    estimatedBusiness: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Qualified",
        "Proposal Shared",
        "Converted",
        "Lost",
        "Hold",
      ],
      default: "New",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SalesExecutiveLead",
  salesExecutiveLeadSchema
);