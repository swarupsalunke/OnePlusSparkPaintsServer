const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    // Feedback Title / Type
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Feedback Type
    feedbackType: {
      type: String,
      enum: [
        "COMPLAINT",
        "SUGGESTION",
        "PRODUCT_FEEDBACK",
        "SERVICE_FEEDBACK",
      ],
      required: true,
    },

    // Optional Description
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Painter Details
    painter: {
      type: String,
      required: true,
      trim: true,
    },

    // Location / Branch
    location: {
      type: String,
      trim: true,
      default: "",
    },

    // Feedback Status
    status: {
      type: String,
      enum: [
        "OPEN",
        "ASSIGNED",
        "UNDER_REVIEW",
        "RESOLVED",
        "CLOSED",
      ],
      default: "OPEN",
    },

    // Priority
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    // Attachments
    image: {
      type: String,
      default: "",
    },

    audio: {
      type: String,
      default: "",
    },

    video: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);