const mongoose = require("mongoose");

const painterLeadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PainterCustomer",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      required: true,
      trim: true,
    },

    assignedPainter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lastActivity: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Assigned", "Accepted", "Rejected", "In Progress", "Completed"],
      default: "Assigned",
    },

    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "Assigned",
            "Accepted",
            "Rejected",
            "In Progress",
            "Completed",
          ],
          required: true,
        },

        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PainterLead", painterLeadSchema);