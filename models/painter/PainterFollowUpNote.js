const mongoose = require("mongoose");

const painterFollowUpNoteSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PainterLead",
      required: true,
    },

    note: {
      type: String,
      required: true,
      trim: true,
    },

    nextFollowUp: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PainterFollowUpNote",
  painterFollowUpNoteSchema
);