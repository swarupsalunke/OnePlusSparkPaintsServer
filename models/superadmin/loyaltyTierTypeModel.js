const mongoose = require("mongoose");

const loyaltyTierTypeSchema = new mongoose.Schema(
  {
    typeName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LoyaltyTierType", loyaltyTierTypeSchema);