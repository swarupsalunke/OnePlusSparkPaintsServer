const mongoose = require("mongoose");

const dealerOrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderTrackingSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "Submitted",
        "Under Review",
        "Approved",
        "Processing",
        "Dispatched",
        "Delivered",
        "Cancelled",
      ],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const dealerOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [dealerOrderItemSchema],
      required: true,
      default: [],
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "Submitted",
        "Under Review",
        "Approved",
        "Processing",
        "Dispatched",
        "Delivered",
        "Cancelled",
      ],
      default: "Submitted",
    },

    trackingHistory: {
      type: [orderTrackingSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DealerOrder", dealerOrderSchema);