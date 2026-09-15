const mongoose = require("mongoose");

const socialMediaPostSchema = new mongoose.Schema(
  {
    // =========================
    // POST DETAILS
    // =========================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      default: "",
      trim: true,
    },

    platform: {
      type: String,
      enum: [
        "Facebook",
        "Instagram",
        "LinkedIn",
        "YouTube",
        "X",
        "WhatsApp",
        "Others",
      ],
      required: true,
    },

    campaign: {
      type: String,
      default: "",
      trim: true,
    },

    postType: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // SCHEDULE
    // =========================

    scheduledDateTime: {
      type: Date,
      default: null,
    },

    postedDateTime: {
      type: Date,
      default: null,
    },

    // =========================
    // STATUS
    // =========================

    status: {
      type: String,
      enum: [
        "Scheduled",
        "Published",
        "In Progress",
        "Failed",
        "Cancelled",
      ],
      default: "Scheduled",
    },

    // =========================
    // ENGAGEMENT
    // =========================

    engagement: {
      views: {
        type: Number,
        default: 0,
      },

      likes: {
        type: Number,
        default: 0,
      },

      comments: {
        type: Number,
        default: 0,
      },
    },

    // =========================
    // PAID CAMPAIGN
    // =========================

    isPaidCampaign: {
      type: Boolean,
      default: false,
    },

    paidCampaignDetails: {
      budget: {
        type: Number,
        default: 0,
      },

      startDate: {
        type: Date,
        default: null,
      },

      endDate: {
        type: Date,
        default: null,
      },
    },

    // =========================
    // POST IMAGE
    // =========================

    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SocialMediaPost",
  socialMediaPostSchema
);