const mongoose = require("mongoose");

const loyaltyTierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            enum: ["SILVER", "GOLD", "PLATINUM"],
            required: true,
            unique: true,
            trim: true,
        },

        minPoints: {
            type: Number,
            required: true,
            min: 0,
        },

        maxPoints: {
            type: Number,
            default: null,
        },

        benefit: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports =
    mongoose.models.LoyaltyTier ||
    mongoose.model("LoyaltyTier", loyaltyTierSchema);