const mongoose = require("mongoose");

const painterShopEnquirySchema = new mongoose.Schema(
  {
    painter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
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
      },
    ],

    preferredDealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "CONVERTED_TO_ORDER",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PainterShopEnquiry",
  painterShopEnquirySchema
);