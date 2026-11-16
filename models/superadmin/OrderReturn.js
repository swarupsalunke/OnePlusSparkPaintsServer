const mongoose = require("mongoose");

const orderReturnSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },

        dealer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },

                total: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],

        returnReason: {
            type: String,
            required: true,
            trim: true,
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },

        returnAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        returnStatus: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Completed"],
            default: "Pending",
        },

        refundStatus: {
            type: String,
            enum: ["Pending", "Refunded", "Not Applicable"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("OrderReturn", orderReturnSchema);