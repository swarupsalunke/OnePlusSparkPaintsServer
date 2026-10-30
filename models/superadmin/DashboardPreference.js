
const mongoose = require("mongoose");

const dashboardPreferenceSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    visibleViews: {
      type: [String],
      default: [
        "statistics",
        "salesOverview",
        "orderStatus",
        "quickActions",
        "topSellingProducts",
        "topDealers",
        "recentActivity",
        "systemOverview",
        "kycOverview",
        "userStatus",
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "DashboardPreference",
  dashboardPreferenceSchema
);
