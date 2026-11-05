const cron = require("node-cron");
const User = require("../models/superadmin/User");
const UserActivity = require("../models/superadmin/UserActivity");

const checkInactiveUsers = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await User.find({
      role: {
        $in: [
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
          "HR_ADMIN_EXECUTIVE",
          "DIRECTOR",
          "MANAGER",
        ],
      },
      status: "ACTIVE",
      isManuallyInactive: { $ne: true },
    });

    let inactiveCount = 0;

    for (const user of users) {
      const lastActivity = await UserActivity.findOne({
        user: user._id,
      }).sort({ occurredAt: -1 });

      const lastActivityDate = lastActivity
        ? lastActivity.occurredAt
        : user.createdAt;

      if (lastActivityDate && lastActivityDate <= thirtyDaysAgo) {
        user.status = "INACTIVE";
        await user.save();

        inactiveCount++;
      }
    }

    console.log(
      `User inactivity check completed. Inactive users: ${inactiveCount}`
    );
  } catch (error) {
    console.error("User inactivity check error:", error);
  }
};

const startUserInactivityService = () => {
  cron.schedule(
    "0 0 * * *",
    () => {
      checkInactiveUsers();
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log("User inactivity cron service started");
};

module.exports = {
  startUserInactivityService,
  checkInactiveUsers,
};