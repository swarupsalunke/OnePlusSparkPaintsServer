const mongoose = require("mongoose");

const dispatchSchema = new mongoose.Schema(
  {
    dispatchNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    dispatchDate: {
      type: Date,
      default: Date.now,
    },

    customer: {
      type: String,
      required: true,
      trim: true,
    },

    invoice: {
      type: String,
      required: true,
      trim: true,
    },

    route: {
      type: String,
      trim: true,
    },

    destination: {
      type: String,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    driver: {
      type: String,
      trim: true,
    },

    vehicle: {
      type: String,
      trim: true,
    },

    transportMode: {
      type: String,
      trim: true,
    },

    transporter: {
      type: String,
      trim: true,
    },

    dispatchTeam: {
      type: [String],
      default: [],
    },

    pod: {
      type: String,
      default: "",
    },

    vehiclePhotos: {
      type: [String],
      default: [],
    },

    invoiceUpload: {
      type: String,
      default: "",
    },

    deliveryChallan: {
      type: String,
      default: "",
    },

    acknowledgement: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "DISPATCHED",
        "DELIVERED",
        "CLOSED",
      ],
      default: "PENDING",
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Dispatch",
  dispatchSchema
);