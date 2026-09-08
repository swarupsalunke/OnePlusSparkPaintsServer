const Commission = require("../models/commissionModel");

// =========================================================
// CREATE / CALCULATE COMMISSION
// =========================================================
exports.createCommission = async (req, res) => {
    try {
        const {
            invoiceNumber,
            customer,
            store,
            territory,
            salesExecutive,
            saleDate,
            invoiceValue,
            saleType,
            paymentDate,
            paymentStatus,
            rewardPoints,
        } = req.body;

        let recoveryDays = 0;
        let commissionPercentage = 0;
        let commissionAmount = 0;
        let penaltyAmount = 0;

        // Calculate recovery days for credit sale
        if (saleType === "CREDIT" && paymentDate) {
            const start = new Date(saleDate);
            const payment = new Date(paymentDate);

            recoveryDays = Math.max(
                0,
                Math.ceil(
                    (payment - start) / (1000 * 60 * 60 * 24)
                )
            );
        }

        // Cash Sale → 1%
        if (saleType === "CASH") {
            commissionPercentage = 1;
        }

        // Credit Sale
        if (saleType === "CREDIT") {
            if (recoveryDays <= 60) {
                commissionPercentage = 1;
            } else if (recoveryDays <= 90) {
                commissionPercentage = 0.5;
            } else {
                commissionPercentage = 0;
                penaltyAmount = Number(invoiceValue) * 0.01;
            }
        }

        // Commission Amount
        commissionAmount =
            Number(invoiceValue) *
            (commissionPercentage / 100);

        // Net Commission
        const netCommission = Math.max(
            0,
            commissionAmount - penaltyAmount
        );

        // Create Commission
        const commission = await Commission.create({
            invoiceNumber,
            customer,
            store,
            territory,
            salesExecutive,
            saleDate,
            invoiceValue,
            saleType,
            paymentDate: paymentDate || null,
            recoveryDays,
            rewardPoints:
                rewardPoints !== undefined
                    ? Number(rewardPoints)
                    : 0,
            commissionPercentage,
            commissionAmount,
            penaltyAmount,
            netCommission,
            paymentStatus:
                paymentStatus ||
                (saleType === "CREDIT"
                    ? "PENDING"
                    : "PAID"),
            commissionStatus: "PENDING_CALCULATION",
        });

        res.status(201).json({
            success: true,
            message: "Commission created successfully",
            commission,
        });
    } catch (error) {
        console.error("Create commission error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create commission",
            error: error.message,
        });
    }
};


// =========================================================
// GET ALL COMMISSIONS
// =========================================================
exports.getCommissions = async (req, res) => {
    try {
        const commissions = await Commission.find().sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: commissions.length,
            commissions,
        });
    } catch (error) {
        console.error("Get commissions error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch commissions",
            error: error.message,
        });
    }
};


// =========================================================
// GET SINGLE COMMISSION
// =========================================================
exports.getCommissionById = async (req, res) => {
    try {
        const commission = await Commission.findById(
            req.params.id
        );

        if (!commission) {
            return res.status(404).json({
                success: false,
                message: "Commission not found",
            });
        }

        res.status(200).json({
            success: true,
            commission,
        });
    } catch (error) {
        console.error("Get commission error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch commission",
            error: error.message,
        });
    }
};


// =========================================================
// UPDATE / RECALCULATE COMMISSION
// =========================================================
exports.updateCommission = async (req, res) => {
    try {
        const {
            invoiceNumber,
            customer,
            store,
            territory,
            salesExecutive,
            saleDate,
            invoiceValue,
            saleType,
            paymentDate,
            paymentStatus,
            commissionStatus,
            rewardPoints,
        } = req.body;

        // Find existing commission
        const existingCommission =
            await Commission.findById(req.params.id);

        if (!existingCommission) {
            return res.status(404).json({
                success: false,
                message: "Commission not found",
            });
        }

        // Existing / Updated Values
        const finalSaleDate =
            saleDate || existingCommission.saleDate;

        const finalInvoiceValue =
            invoiceValue !== undefined
                ? Number(invoiceValue)
                : Number(existingCommission.invoiceValue);

        const finalSaleType =
            saleType || existingCommission.saleType;

        const finalPaymentDate =
            paymentDate !== undefined
                ? paymentDate
                : existingCommission.paymentDate;

        // =====================================================
        // RECOVERY DAYS
        // =====================================================
        let recoveryDays = 0;

        if (
            finalSaleType === "CREDIT" &&
            finalPaymentDate
        ) {
            const start = new Date(finalSaleDate);
            const payment = new Date(finalPaymentDate);

            recoveryDays = Math.max(
                0,
                Math.ceil(
                    (payment - start) /
                        (1000 * 60 * 60 * 24)
                )
            );
        }

        // =====================================================
        // COMMISSION CALCULATION
        // =====================================================
        let commissionPercentage = 0;
        let commissionAmount = 0;
        let penaltyAmount = 0;

        // Cash Sale → 1%
        if (finalSaleType === "CASH") {
            commissionPercentage = 1;
        }

        // Credit Sale
        if (finalSaleType === "CREDIT") {
            if (recoveryDays <= 60) {
                commissionPercentage = 1;
            } else if (recoveryDays <= 90) {
                commissionPercentage = 0.5;
            } else {
                commissionPercentage = 0;
                penaltyAmount =
                    finalInvoiceValue * 0.01;
            }
        }

        // Commission Amount
        commissionAmount =
            finalInvoiceValue *
            (commissionPercentage / 100);

        // Net Commission
        const netCommission = Math.max(
            0,
            commissionAmount - penaltyAmount
        );

        // =====================================================
        // UPDATE DATA
        // =====================================================
        const updateData = {
            invoiceNumber:
                invoiceNumber !== undefined
                    ? invoiceNumber
                    : existingCommission.invoiceNumber,

            customer:
                customer !== undefined
                    ? customer
                    : existingCommission.customer,

            store:
                store !== undefined
                    ? store
                    : existingCommission.store,

            territory:
                territory !== undefined
                    ? territory
                    : existingCommission.territory,

            salesExecutive:
                salesExecutive !== undefined
                    ? salesExecutive
                    : existingCommission.salesExecutive,

            saleDate: finalSaleDate,

            invoiceValue: finalInvoiceValue,

            saleType: finalSaleType,

            paymentDate: finalPaymentDate || null,

            recoveryDays,

            rewardPoints:
                rewardPoints !== undefined
                    ? Number(rewardPoints)
                    : existingCommission.rewardPoints,

            commissionPercentage,

            commissionAmount,

            penaltyAmount,

            netCommission,

            paymentStatus:
                paymentStatus !== undefined
                    ? paymentStatus
                    : existingCommission.paymentStatus,

            commissionStatus:
                commissionStatus !== undefined
                    ? commissionStatus
                    : existingCommission.commissionStatus,
        };

        // Update Commission
        const commission =
            await Commission.findByIdAndUpdate(
                req.params.id,
                updateData,
                {
                    returnDocument: "after",
                    runValidators: true,
                }
            );

        res.status(200).json({
            success: true,
            message: "Commission updated successfully",
            commission,
        });
    } catch (error) {
        console.error(
            "Update commission error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update commission",
            error: error.message,
        });
    }
};


// =========================================================
// UPDATE COMMISSION STATUS
// =========================================================
exports.updateCommissionStatus = async (req, res) => {
    try {
        const { commissionStatus } = req.body;

        const commission =
            await Commission.findByIdAndUpdate(
                req.params.id,
                { commissionStatus },
                {
                    returnDocument: "after",
                    runValidators: true,
                }
            );

        if (!commission) {
            return res.status(404).json({
                success: false,
                message: "Commission not found",
            });
        }

        res.status(200).json({
            success: true,
            message:
                "Commission status updated successfully",
            commission,
        });
    } catch (error) {
        console.error(
            "Update commission status error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update commission status",
            error: error.message,
        });
    }
};


// =========================================================
// DELETE COMMISSION
// =========================================================
exports.deleteCommission = async (req, res) => {
    try {
        const commission =
            await Commission.findByIdAndDelete(
                req.params.id
            );

        if (!commission) {
            return res.status(404).json({
                success: false,
                message: "Commission not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Commission deleted successfully",
        });
    } catch (error) {
        console.error(
            "Delete commission error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to delete commission",
            error: error.message,
        });
    }
};