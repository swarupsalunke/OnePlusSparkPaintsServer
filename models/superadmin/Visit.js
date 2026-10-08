const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    visitType: {
      type: String,
      enum: ["DEALER", "RETAILER", "PAINTER"],
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerId: {
      type: String,
      trim: true,
      default: "",
    },

    customerMobile: {
      type: String,
      trim: true,
      default: "",
    },

    territory: {
      type: String,
      trim: true,
      default: "",
    },

    beat: {
      type: String,
      trim: true,
      default: "",
    },

    route: {
      type: String,
      trim: true,
      default: "",
    },

    visitDate: {
      type: Date,
      required: true,
    },

    visitTime: {
      type: String,
      trim: true,
      default: "",
    },

    assignedTo: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },

    visitStatus: {
      type: String,
      enum: [
        "PLANNED",
        "IN_PROGRESS",
        "COMPLETED",
        "MISSED",
        "RESCHEDULED",
      ],
      default: "PLANNED",
    },

    gpsTracking: {
      enabled: {
        type: Boolean,
        default: false,
      },

      lastLatitude: {
        type: Number,
        default: null,
      },

      lastLongitude: {
        type: Number,
        default: null,
      },

      lastTrackedAt: {
        type: Date,
        default: null,
      },
    },

    visitPhoto: {
      type: String,
      trim: true,
      default: "",
    },

    meetingNotes: {
      type: String,
      trim: true,
      default: "",
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    productDiscussion: {
      type: String,
      trim: true,
      default: "",
    },

    orderBooking: {
      type: String,
      trim: true,
      default: "",
    },

    collectionEntry: {
      type: String,
      trim: true,
      default: "",
    },

    complaintRegistration: {
      type: String,
      trim: true,
      default: "",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Visit", visitSchema);