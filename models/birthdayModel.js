const mongoose = require("mongoose");

const birthdaySchema = new mongoose.Schema(
  {
    // Person Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // User Type
    userType: {
      type: String,
      enum: [
        "DEALER",
        "PAINTER",
        "EMPLOYEE",
        "CUSTOM",
      ],
      required: true,
    },

    // Custom user type/category
    customType: {
      type: String,
      trim: true,
      default: "",
    },

    // Date of Birth
    dateOfBirth: {
      type: Date,
      required: true,
    },

    // Mobile Number
    mobileNumber: {
      type: String,
      trim: true,
      default: "",
    },

    // Location / Branch
    location: {
      type: String,
      trim: true,
      default: "",
    },

    // Birthday Reminder
    reminderEnabled: {
      type: Boolean,
      default: true,
    },

    // Birthday Greeting
    greetingSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Birthday",
  birthdaySchema
);