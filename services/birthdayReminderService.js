const cron = require("node-cron");
const Birthday = require("../models/birthdayModel");

// =====================================================
// BIRTHDAY REMINDER CHECK
// =====================================================
const checkBirthdayReminders = async () => {
  try {
    const today = new Date();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    const tomorrowMonth = tomorrow.getMonth();
    const tomorrowDate = tomorrow.getDate();

    const birthdays = await Birthday.find({
      reminderEnabled: true,
    });

    birthdays.forEach((birthday) => {
      const dob = new Date(birthday.dateOfBirth);

      const birthdayMonth = dob.getMonth();
      const birthdayDate = dob.getDate();

      // Birthday today
      if (
        birthdayMonth === todayMonth &&
        birthdayDate === todayDate
      ) {
        console.log(
          `🎂 Birthday Reminder: ${birthday.name} has birthday today.`
        );
      }

      // Birthday tomorrow
      if (
        birthdayMonth === tomorrowMonth &&
        birthdayDate === tomorrowDate
      ) {
        console.log(
          `🔔 Birthday Reminder: ${birthday.name} has birthday tomorrow.`
        );
      }
    });
  } catch (error) {
    console.error(
      "Birthday reminder error:",
      error
    );
  }
};


// =====================================================
// DAILY BIRTHDAY REMINDER
// Runs every day at 8:00 AM
// =====================================================
const startBirthdayReminderService = () => {
  cron.schedule("0 8 * * *", () => {
    console.log(
      "Checking birthday reminders..."
    );

    checkBirthdayReminders();
  });

  console.log(
    "Birthday reminder service started."
  );
};


module.exports = {
  checkBirthdayReminders,
  startBirthdayReminderService,
};