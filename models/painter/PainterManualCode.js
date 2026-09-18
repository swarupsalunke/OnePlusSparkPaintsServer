const mongoose = require("mongoose");

const painterManualCodeSchema = new mongoose.Schema(
  {
    painter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    verificationCode: {
      type: String,
      required: true,
      trim: true,
    },

    verificationStatus: {
      type: String,
      enum: ["VALID", "INVALID", "DUPLICATE"],
      default: "VALID",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PainterManualCode",
  painterManualCodeSchema
);