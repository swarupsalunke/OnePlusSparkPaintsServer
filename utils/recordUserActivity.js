const User = require("../models/superadmin/User");
const UserActivity = require("../models/superadmin/UserActivity");

const recordUserActivity = async ({
  userId,
  role,
  activityType,
  referenceId = null,
  metadata = {},
}) => {
  try {
    if (!userId || !activityType) {
      return null;
    }

    const allowedRoles = [
      "PAINTER",
      "DEALER",
      "SALES_EXECUTIVE",
      "ACCOUNTANT",
      "STORE_CASHIER",
      "STORE_MANAGER",
      "PRODUCTION_MANAGER",
      "SALES_MANAGER",
      "ACCOUNT_MANAGER",
      "MARKETING_MANAGER",
      // "HR_ADMIN_EXECUTIVE",
      // "DIRECTOR",
      // "MANAGER",
    ];

    if (!allowedRoles.includes(role)) {
      return null;
    }

    const user = await User.findById(userId);

    if (!user || user.role !== role) {
      return null;
    }

    const activity = await UserActivity.create({
      user: user._id,
      role,
      activityType,
      referenceId,
      occurredAt: new Date(),
      metadata,
    });

    // Automatically reactivate only auto-inactive users
    if (user.status === "INACTIVE") {
      user.status = "ACTIVE";
      user.isManuallyInactive = false;
      await user.save();
    }

    return activity;
  } catch (error) {
    console.error("User activity tracking error:", error);
    return null;
  }
};

module.exports = recordUserActivity;