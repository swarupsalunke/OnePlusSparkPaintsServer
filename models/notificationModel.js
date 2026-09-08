const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    channel: {
      type: String,
      enum: ["PUSH", "EMAIL", "SMS"],
      required: true,
    },

    userType: {
      type: String,
      enum: [
        "ALL_USERS",
        "DEALERS",
        "PAINTERS",
        "REFERRERS",
        "STORE_STAFF",
        "SUBSCRIBERS",
      ],
      required: true,
    },

    targetAudience: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    territory: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["SENT", "PENDING", "FAILED", "DRAFT"],
      default: "PENDING",
    },

    sentOn: {
      type: Date,
      default: Date.now,
    },

    sentTo: {
      type: Number,
      default: 0,
      min: 0,
    },

    openRate: {
      type: String,
      default: "-",
    },

    clickRate: {
      type: String,
      default: "-",
    },

    link: {
      type: String,
      default: "",
      trim: true,
    },

    attachment: {
      type: String,
      default: "",
    },

    attachmentType: {
      type: String,
      enum: ["IMAGE", "PDF", ""],
      default: "",
    },

    whatsapp: {
      type: Boolean,
      default: false,
    },

    socialMedia: {
      type: Boolean,
      default: false,
    },

    pushNotification: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);