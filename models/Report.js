const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "SALES",
        "FINANCE",
        "INVENTORY",
        "SCHEME_REWARDS",
        "CUSTOMER",
        "USER_ACTIVITY",
      ],
      required: true,
    },

    reportType: {
      type: String,
      required: true,
      trim: true,
    },

    generatedOn: {
      type: Date,
      default: Date.now,
    },

    generatedBy: {
      type: String,
      required: true,
      trim: true,
    },

    format: {
      type: String,
      enum: ["PDF", "EXCEL"],
      required: true,
    },

    downloaded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);