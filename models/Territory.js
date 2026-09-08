const mongoose = require("mongoose");

const territorySchema = new mongoose.Schema(
  {
    territoryName: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      trim: true,
      default: "",
    },

    assignedTo: {
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

module.exports = mongoose.model("Territory", territorySchema);