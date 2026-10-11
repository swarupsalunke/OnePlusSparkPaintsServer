
const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema(
  {
    salesExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    periodType: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "ANNUAL"],
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
      default: null,
    },
    quarter: {
      type: Number,
      min: 1,
      max: 4,
      default: null,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    incentiveTargetPercent: {
      type: Number,
      default: 100,
      min: 0,
      max: 1000,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

targetSchema.pre("validate", function (next) {
  if (this.periodType === "MONTHLY") {
    this.quarter = null;
    if (!this.month) {
      this.invalidate("month", "Month is required for a monthly target");
    }
  } else if (this.periodType === "QUARTERLY") {
    this.month = null;
    if (!this.quarter) {
      this.invalidate("quarter", "Quarter is required for a quarterly target");
    }
  } else if (this.periodType === "ANNUAL") {
    this.month = null;
    this.quarter = null;
  }

  next();
});

targetSchema.index(
  { salesExecutive: 1, periodType: 1, year: 1, month: 1, quarter: 1 },
  { unique: true }
);

module.exports = mongoose.model("Target", targetSchema);
