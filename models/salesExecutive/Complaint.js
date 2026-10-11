
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      trim: true,
    },

    complaintType: {
      type: String,
      enum: ["PAINTER", "DEALER", "PRODUCT", "SERVICE"],
      required: true,
    },

    // Selected Painter
    painter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PainterProfile",
      default: null,
    },

    // Selected Dealer
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Selected Product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true,
      default: "MEDIUM",
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
      enum: ["NEW", "ASSIGNED", "UNDER_REVIEW", "RESOLVED", "CLOSED"],
      default: "NEW",
    },

    assignedDepartment: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ complaintType: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.models.SalesExecutiveComplaint || mongoose.model("SalesExecutiveComplaint", complaintSchema);
