const mongoose = require("mongoose");

const supplierItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    gstTax: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: true }
);

const supplierVendorSchema = new mongoose.Schema(
  {
    supplierCompanyName: {
      type: String,
      required: true,
      trim: true,
    },

    contactPersonName: {
      type: String,
      required: true,
      trim: true,
    },

    mobileNo: {
      type: String,
      required: true,
      trim: true,
    },

    mobileNo2: {
      type: String,
      trim: true,
      default: "",
    },

    gstNo: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    paymentTerms: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    items: {
      type: [supplierItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SupplierVendor",
  supplierVendorSchema
);