
const DashboardPreference = require("../../models/superadmin/DashboardPreference");

// All available dashboard views
const DEFAULT_VIEWS = [
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
];

// GET: Fetch Admin Dashboard Preferences
const getDashboardPreferences = async (req, res) => {
  try {
    const adminId = req.user.userId;

    let preference = await DashboardPreference.findOne({ adminId });

    // Create default preferences if not found
    if (!preference) {
      preference = await DashboardPreference.create({
        adminId,
        visibleViews: DEFAULT_VIEWS,
      });
    }

    return res.status(200).json({
      success: true,
      visibleViews: preference.visibleViews,
    });
  } catch (error) {
    console.error("Get Dashboard Preferences Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard preferences",
    });
  }
};

// PUT: Update Admin Dashboard Preferences
const updateDashboardPreferences = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { visibleViews } = req.body;

    if (!Array.isArray(visibleViews)) {
      return res.status(400).json({
        success: false,
        message: "visibleViews must be an array",
      });
    }

    const invalidViews = visibleViews.filter(
      (view) => !DEFAULT_VIEWS.includes(view)
    );

    if (invalidViews.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid dashboard views",
        invalidViews,
      });
    }

    const preference = await DashboardPreference.findOneAndUpdate(
      { adminId },
      { $set: { visibleViews } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Dashboard preferences updated successfully",
      visibleViews: preference.visibleViews,
    });
  } catch (error) {
    console.error("Update Dashboard Preferences Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update dashboard preferences",
    });
  }
};

module.exports = {
  getDashboardPreferences,
  updateDashboardPreferences,
};
