const mongoose = require("mongoose");

const complaintCommentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const complaintSchema = new mongoose.Schema(
  {
    painterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    complaintId: {
      type: String,
      unique: true,
      required: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
      },
    ],

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Open", "Under Review", "Closed"],
      default: "Open",
    },

    comments: [complaintCommentSchema],

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// module.exports = mongoose.model("Complaint", complaintSchema);
module.exports = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);