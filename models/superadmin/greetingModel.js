const mongoose = require("mongoose");

const greetingSchema = new mongoose.Schema(
  {
    // Birthday person
    birthdayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Birthday",
      required: true,
    },

    // Person name
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },

    // Greeting message
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Greeting status
    status: {
      type: String,
      enum: ["SENT", "FAILED"],
      default: "SENT",
    },

    // Greeting sent date
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Greeting",
  greetingSchema
);