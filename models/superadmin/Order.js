const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
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


const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    salesExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    orderType: {
      type: String,
      enum: [
        "Dealer Order",
        "Shop Order",
      ],
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "At least one product is required",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "New",
        "Processing",
        "Approved",
        "Dispatched",
        "Delivered",
        "Cancelled",
      ],
      default: "New",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Partially Paid",
        "Paid",
        "Refunded",
      ],
      default: "Pending",
    },
  },

  {
    timestamps: true,
  }
);


module.exports = mongoose.model(
  "Order",
  orderSchema
);