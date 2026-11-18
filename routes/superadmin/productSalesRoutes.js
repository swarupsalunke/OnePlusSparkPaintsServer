const express = require("express");
const router = express.Router();

// Fetch Product Sales Data
router.get("/", async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Product Sales API is working",
            data: [],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch product sales data",
        });
    }
});

// Check Tally Connection
router.get("/status", async (req, res) => {
    res.json({
        success: true,
        message: "Product Sales API is ready",
        tallyConnected: false,
    });
});

module.exports = router;