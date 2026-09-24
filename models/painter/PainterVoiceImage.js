const mongoose = require("mongoose");

const painterVoiceImageSchema = new mongoose.Schema(
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

        images: [
            {
                type: String,
                required: true,
                trim: true,
            },
        ],

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
    "PainterVoiceImage",
    painterVoiceImageSchema
);