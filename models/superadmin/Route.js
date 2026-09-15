const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      required: true,
      trim: true,
    },

    territory: {
      type: String,
      required: true,
      trim: true,
    },

    beat: {
      type: String,
      trim: true,
      default: "",
    },

    assignedTo: {
      type: String,
      trim: true,
      default: "",
    },

    routeDetails: {
      type: String,
      trim: true,
      default: "",
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

module.exports = mongoose.model("Route", routeSchema);