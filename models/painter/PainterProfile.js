const mongoose = require("mongoose");

const painterProfileSchema = new mongoose.Schema(
  {
    painterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

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

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    serviceableArea: {
      type: String,
      trim: true,
      default: "",
    },

    tier: {
      type: String,
      default: "Silver Painter",
    },

    kycStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PainterProfile",
  painterProfileSchema
);