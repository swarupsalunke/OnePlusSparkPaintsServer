const mongoose = require("mongoose");

const salesExecutiveAttendanceSchema = new mongoose.Schema(
  {
    salesExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    checkIn: {
      timestamp: {
        type: Date,
        default: null,
      },
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      selfie: {
        type: String,
        default: null,
      },
      remarks: {
        type: String,
        trim: true,
        default: "",
      },
    },

    checkOut: {
      timestamp: {
        type: Date,
        default: null,
      },
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },

    liveLocation: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },

    status: {
      type: String,
      enum: ["CHECKED_IN", "CHECKED_OUT"],
      default: "CHECKED_IN",
    },
  },
  {
    timestamps: true,
  }
);

salesExecutiveAttendanceSchema.index(
  { salesExecutive: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "SalesExecutiveAttendance",
  salesExecutiveAttendanceSchema
);