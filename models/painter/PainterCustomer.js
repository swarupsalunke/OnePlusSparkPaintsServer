const mongoose = require("mongoose");

const painterCustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    productInterest: {
      type: String,
      required: true,
      trim: true,
    },

    estimatedBusiness: {
      type: Number,
      required: true,
    },

    source: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PainterCustomer", painterCustomerSchema);