const cron = require("node-cron");
const User = require("../models/superadmin/User");
const UserActivity = require("../models/superadmin/UserActivity");

const checkInactiveUsers = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await User.find({
      role: {
        $in: ["PAINTER", "DEALER", "SALES_EXECUTIVE"],
      },
      status: "ACTIVE",
      isManuallyInactive: false,
    });

    let inactiveCount = 0;

    for (const user of users) {
      const lastActivity = await UserActivity.findOne({
        user: user._id,
      }).sort({ occurredAt: -1 });

      // If no business activity exists, use account creation date
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
  // Run every day at midnight (India time)
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