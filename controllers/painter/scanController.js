const PainterScan = require("../../models/painter/PainterScan");

// POST /api/painter/scan
const scanProduct = async (req, res) => {
    try {
        const painterId = req.user?._id || req.user?.id || req.user?.userId;

        if (!painterId) {
            return res.status(401).json({
                success: false,
                message: "Painter authentication required",
            });
        }

        const { scanCode, scanType } = req.body;

        if (!scanCode) {
            return res.status(400).json({
                success: false,
                message: "Scan code is required",
            });
        }

        if (!scanType) {
            return res.status(400).json({
                success: false,
                message: "Scan type is required",
            });
        }

        const existingScan = await PainterScan.findOne({
            painter: painterId,
            scanCode: scanCode.trim(),
        });

        if (existingScan) {
            return res.status(409).json({
                success: false,
                message: "This code has already been scanned",
                scanStatus: "DUPLICATE",
                scan: existingScan,
            });
        }

        const scan = await PainterScan.create({
            painter: painterId,
            scanCode: scanCode.trim(),
            scanType,
            scanStatus: "VALID",
        });

        return res.status(201).json({
            success: true,
            message: "Product scanned successfully",
            scan,
        });
    } catch (error) {
        console.error("Painter scan error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to process scan",
            error: error.message,
        });
    }
};

module.exports = {
    scanProduct,
};