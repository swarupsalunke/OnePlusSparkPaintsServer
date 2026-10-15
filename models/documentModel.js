const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    // Document Name
    documentName: {
      type: String,
      required: true,
      trim: true,
    },

    // Document Category
    category: {
      type: String,
      enum: [
        "BROCHURE",
        "COLOUR_PALETTE",
        "PRICE_LIST",
        "PRODUCT_CATALOGUE",
        "TECHNICAL_DATA_SHEET",
        "WARRANTY",
        "APPLICATION_GUIDE",
        "MARKETING_MATERIALS",
        "CUSTOM",
      ],
      required: true,
    },

    // Custom category name
    customCategory: {
      type: String,
      trim: true,
      default: "",
    },

    // Uploaded file information
    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,
      enum: ["PDF", "IMAGE", "DOCUMENT", "OTHER"],
      default: "PDF",
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    // Who can access/download this document
    accessTo: {
      type: [
        {
          type: String,
          enum: ["DEALERS", "PAINTERS", "SALES_TEAM"],
        },
      ],
      required: true,
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message: "At least one access type is required",
      },
    },

    // Document status
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "DISABLED"],
      default: "DRAFT",
    },

    // Optional description
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Number of downloads
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Published date
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);