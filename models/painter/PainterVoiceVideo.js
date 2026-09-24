const mongoose = require("mongoose");

const painterVoiceVideoSchema = new mongoose.Schema(
    {
        painter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        video: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "OPEN",
                "ASSIGNED",
                "UNDER_REVIEW",
                "RESOLVED",
                "CLOSED",
            ],
            default: "OPEN",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "PainterVoiceVideo",
    painterVoiceVideoSchema
);