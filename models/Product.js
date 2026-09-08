const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    barcode: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subCategory: {
      type: String,
      trim: true,
    },

    // ======================================================
    // PRODUCT GROUP
    // ======================================================

    group: {
      type: String,
      enum: [
        "Paints",
        "Primers",
        "Putty & Fillers",
        "Thinners",
        "Others",
      ],
      default: "Others",
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    packingSize: {
      type: String,
      required: true,
      trim: true,
    },

    mrp: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);