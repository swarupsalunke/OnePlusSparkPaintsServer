const mongoose = require("mongoose");

const painterFeedbackSchema = new mongoose.Schema(
    {
        painter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        feedbackType: {
            type: String,
            enum: [
                "COMPLAINT",
                "SUGGESTION",
                "PRODUCT_FEEDBACK",
                "SERVICE_FEEDBACK",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        attachments: [
            {
                type: String,
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
    "PainterFeedback",
    painterFeedbackSchema
);