const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
    {
        schemeId: {
            type: String,
            unique: true,
            required: true,
        },

        schemeName: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        schemeType: {
            type: String,
            enum: ["CASHBACK", "REWARD", "DISCOUNT"],
            required: true,
        },

        applicableTo: {
            type: String,
            enum: [
                "DEALERS",
                "PAINTERS",
                "BOTH",
            ],
            required: true,
        },

        banner: {
            type: String,
            default: "",
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        pdf: {
            type: String,
            default: "",
        },

        termsAndConditions: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "DRAFT",
                "UPCOMING",
                "ACTIVE",
                "EXPIRED",
            ],
            default: "DRAFT",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Scheme", schemeSchema);