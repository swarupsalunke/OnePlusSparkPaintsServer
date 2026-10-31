const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    // DEPARTMENT or DIRECT
    type: {
      type: String,
      enum: ["DEPARTMENT", "DIRECT"],
      required: true,
    },

    // Department channel name
    department: {
      type: String,
      trim: true,
      default: "",
    },

    // Department channel unique key
    departmentKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Direct chat participants
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Unique key for a pair of direct-chat users
    directKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ type: 1, updatedAt: -1 });

module.exports = mongoose.model(
  "Conversation",
  conversationSchema
);