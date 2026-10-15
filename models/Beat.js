const mongoose = require("mongoose");

const beatSchema = new mongoose.Schema(
  {
    beatName: {
      type: String,
      required: true,
      trim: true,
    },

    territory: {
      type: String,
      required: true,
      trim: true,
    },

    assignedTo: {
      type: String,
      trim: true,
      default: "",
    },

    customers: {
      type: [String],
      default: [],
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

module.exports = mongoose.model("Beat", beatSchema);