const PainterBarcodeScan = require("../../models/painter/PainterBarcodeScan");
const Product = require("../../models/superadmin/Product");
const RewardTransaction = require("../../models/superadmin/RewardTransaction");

// GET /api/painter/scan-history
const getPainterScanHistory = async (req, res) => {
  try {
    const painterId =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const scans = await PainterBarcodeScan.find({
      painter: painterId,
    }).sort({ createdAt: -1 });

    const history = await Promise.all(
      scans.map(async (scan) => {
        const product = await Product.findOne({
          barcode: scan.scanCode,
        }).select("productName");

        const rewardTransaction = await RewardTransaction.findOne({
          user: painterId,
          userType: "PAINTER",
          rewardType: "POINTS",
          transactionType: "ADD",
          reference: scan.scanCode,
        }).sort({ createdAt: -1 });

        let reward = 0;

        if (rewardTransaction) {
          reward = rewardTransaction.points || 0;
        }

        let status = "Invalid";

        if (scan.scanStatus === "VALID") {
          status = "Success";
        } else if (scan.scanStatus === "DUPLICATE") {
          status = "Duplicate";
        }

        return {
          id: scan._id,
          dateTime: scan.createdAt,
          product: product?.productName || "-",
          code: scan.scanCode,
          reward,
          status,
        };
      })
    );

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Painter scan history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch scan history",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterScanHistory,
};