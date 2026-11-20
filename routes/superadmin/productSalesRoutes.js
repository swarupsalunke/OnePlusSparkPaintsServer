
const express = require("express");
const router = express.Router();

// Temporary Tally JSON response for testing
// Actual Tally API connection will be added later.
const tallyResponse = {
    tallymessage: [
        {
            metadata: {
                type: "Voucher",
                vchtype: "GJ01 Sales",
                action: "Create"
            },
            vouchernumber: "20267000150",
            date: "20260731",
            partyname: "EQUIRUS CAPITAL PRIVATE LIMITED",
            partygstin: "27AABCE8020A1Z9",
            cmpgstin: "24AAFCE0297D1ZY",

            ledgerentries: [
                {
                    ledgername: "EQUIRUS CAPITAL PRIVATE LIMITED",
                    amount: "-116.82"
                },
                {
                    ledgername: "DP Income",
                    amount: "99.00"
                },
                {
                    ledgername: "IGST @ 18%",
                    amount: "17.82"
                }
            ]
        }
    ]
};

// Fetch Product Sales Data
router.get("/", async (req, res) => {
    try {
        const vouchers = Array.isArray(tallyResponse.tallymessage)
            ? tallyResponse.tallymessage.map((voucher) => {

                const ledgerEntries = Array.isArray(voucher.ledgerentries)
                    ? voucher.ledgerentries.map((item) => ({
                        ledgerName: item.ledgername || "",
                        amount: Number(item.amount) || 0
                    }))
                    : [];

                return {
                    voucherNumber: voucher.vouchernumber || "",
                    voucherType: voucher.metadata?.vchtype || "",
                    date: voucher.date || "",
                    partyName: voucher.partyname || "",
                    partyGSTIN: voucher.partygstin || "",
                    companyGSTIN: voucher.cmpgstin || "",
                    ledgerEntries
                };
            })
            : [];

        res.status(200).json({
            success: true,
            message: "Product Sales data fetched successfully",
            totalVouchers: vouchers.length,
            data: vouchers
        });

    } catch (error) {
        console.error("Product Sales Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch product sales data",
            error: error.message
        });
    }
});

// Check Tally Connection Status
router.get("/status", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Product Sales API is ready",
        tallyConnected: false
    });
});

module.exports = router;
