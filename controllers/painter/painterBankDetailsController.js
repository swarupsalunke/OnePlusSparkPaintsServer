const PainterBankDetails = require("../../models/painter/PainterBankDetails");

const getPainterBankDetails = async (req, res) => {
    try {
        const painterId = req.user.userId;

        const bankDetails = await PainterBankDetails.findOne({
            painterId,
        });

        if (!bankDetails) {
            return res.status(404).json({
                success: false,
                message: "Bank details not found",
            });
        }

        const bankData = bankDetails.toObject();

        if (bankData.accountNumber) {
            const accountNumber = bankData.accountNumber;
            bankData.accountNumber =
                "•••• •••• " + accountNumber.slice(-4);
        }

        res.status(200).json({
            success: true,
            data: bankData,
        });
    } catch (error) {
        console.error("Get Painter Bank Details Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bank details",
            error: error.message,
        });
    }
};

const createPainterBankDetails = async (req, res) => {
    try {
        const painterId = req.user.userId;

        const existingDetails = await PainterBankDetails.findOne({
            painterId,
        });

        if (existingDetails) {
            return res.status(400).json({
                success: false,
                message: "Bank details already exist",
            });
        }

        const {
            accountHolder,
            bankName,
            accountNumber,
            ifsc,
            verificationStatus,
        } = req.body;

        if (!accountHolder || !bankName || !accountNumber || !ifsc) {
            return res.status(400).json({
                success: false,
                message: "All bank details are required",
            });
        }

        const bankDetails = await PainterBankDetails.create({
            painterId,
            accountHolder,
            bankName,
            accountNumber,
            ifsc,
            verificationStatus,
        });

        const bankData = bankDetails.toObject();

        bankData.accountNumber =
            "•••• •••• " + bankData.accountNumber.slice(-4);

        res.status(201).json({
            success: true,
            message: "Bank details created successfully",
            data: bankData,
        });
    } catch (error) {
        console.error("Create Painter Bank Details Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create bank details",
            error: error.message,
        });
    }
};

const updatePainterBankDetails = async (req, res) => {
    try {
        const painterId = req.user.userId;

        const { accountHolder, bankName, accountNumber, ifsc } = req.body;

        if (!accountHolder || !bankName || !accountNumber || !ifsc) {
            return res.status(400).json({
                success: false,
                message: "All bank details are required",
            });
        }

        const bankDetails = await PainterBankDetails.findOneAndUpdate(
            { painterId },
            {
                accountHolder,
                bankName,
                accountNumber,
                ifsc,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!bankDetails) {
            return res.status(404).json({
                success: false,
                message: "Bank details not found",
            });
        }

        const bankData = bankDetails.toObject();

        bankData.accountNumber =
            "•••• •••• " + bankData.accountNumber.slice(-4);

        res.status(200).json({
            success: true,
            message: "Bank details updated successfully",
            data: bankData,
        });
    } catch (error) {
        console.error("Update Painter Bank Details Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update bank details",
            error: error.message,
        });
    }
};

module.exports = {
    getPainterBankDetails,
    createPainterBankDetails,
    updatePainterBankDetails,
};