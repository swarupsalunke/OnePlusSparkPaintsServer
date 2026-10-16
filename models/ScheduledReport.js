const mongoose = require("mongoose");

const scheduledReportSchema = new mongoose.Schema(
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

    schedule: {
      type: String,
      required: true,
      trim: true,
    },

    nextRun: {
      type: Date,
      required: true,
    },

    format: {
      type: String,
      enum: ["PDF", "EXCEL"],
      required: true,
    },

    recipients: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["ACTIVE", "PAUSED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ScheduledReport",
  scheduledReportSchema
);