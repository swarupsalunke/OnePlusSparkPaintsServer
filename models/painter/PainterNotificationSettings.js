const mongoose = require("mongoose");

const painterNotificationSettingsSchema = new mongoose.Schema(
  {
    painterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    rewardCredited: {
      type: Boolean,
      default: true,
    },
    newSchemesOffers: {
      type: Boolean,
      default: true,
    },
    leadUpdates: {
      type: Boolean,
      default: true,
    },
    orderEnquiryUpdates: {
      type: Boolean,
      default: true,
    },
    complaintUpdates: {
      type: Boolean,
      default: true,
    },
    marketingCampaigns: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PainterNotificationSettings",
  painterNotificationSettingsSchema
);