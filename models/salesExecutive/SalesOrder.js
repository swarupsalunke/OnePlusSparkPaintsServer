
const mongoose = require("mongoose");

const salesOrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: { type: String, required: true },
  sku: { type: String, default: "" },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true, default: "Unit" },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 },
}, { _id: false });

const salesOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
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
  items: {
    type: [salesOrderItemSchema],
    required: true,
    validate: {
      validator: (items) => items.length > 0,
      message: "Order must contain at least one product",
    },
  },
  subtotal: { type: Number, required: true, min: 0 },
  totalDiscount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  appliedSchemes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scheme",
  }],
  remarks: { type: String, default: "" },
  status: {
    type: String,
    enum: [
      "Draft",
      "Submitted",
      "Approved",
      "Processing",
      "Dispatched",
      "Delivered",
      "Cancelled",
    ],
    default: "Submitted",
  },
  trackingHistory: [{
    status: {
      type: String,
      enum: [
        "Draft",
        "Submitted",
        "Approved",
        "Processing",
        "Dispatched",
        "Delivered",
        "Cancelled",
      ],
      required: true,
    },
    date: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model("SalesOrder", salesOrderSchema);
