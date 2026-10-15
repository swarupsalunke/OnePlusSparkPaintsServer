const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
    {
        leadNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        leadName: {
            type: String,
            required: true,
            trim: true,
        },

        companyName: {
            type: String,
            required: true,
            trim: true,
        },

        mobile: {
            type: String,
            required: true,
            trim: true,
        },

        leadSource: {
            type: String,
            enum: [
                "Referral",
                "Walk-in",
                "Website",
                "Social Media",
                "Cold Call",
                "Trade Show",
            ],
            required: true,
        },

        status: {
            type: String,
            enum: [
                "New",
                "Follow-up",
                "Qualified",
                "Proposal Shared",
                "Converted",
                "Lost",
            ],
            default: "New",
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        territory: {
            type: String,
            trim: true,
            default: "",
        },

        createdOn: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Lead", leadSchema);