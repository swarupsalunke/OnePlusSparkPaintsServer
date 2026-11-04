const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["PAINTER", "DEALER", "SALES_EXECUTIVE"],
      required: true,
    },

    activityType: {
      type: String,
      required: true,
      trim: true,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    occurredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

userActivitySchema.index({ user: 1, occurredAt: -1 });

module.exports = mongoose.model("UserActivity", userActivitySchema);