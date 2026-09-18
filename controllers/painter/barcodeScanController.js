const PainterBarcodeScan = require("../../models/painter/PainterBarcodeScan");
const Product = require("../../models/superadmin/Product");
const RewardTransaction = require("../../models/superadmin/RewardTransaction");

// POST /api/painter/barcode-scan
const verifyBarcodeScan = async (req, res) => {
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

    const { scanCode, scanType } = req.body || {};

    if (!scanCode || !scanType) {
      return res.status(400).json({
        success: false,
        message: "scanCode and scanType are required",
      });
    }

    if (!["QR", "BARCODE"].includes(scanType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scan type",
      });
    }

    const code = scanCode.trim();

    // Check whether this code was already scanned
    const existingScan = await PainterBarcodeScan.findOne({
      scanCode: code,
    });

    // Find product using barcode
    const product = await Product.findOne({
      barcode: code,
      status: "ACTIVE",
    });

    // If code was already scanned
    if (existingScan) {
      const duplicateScan = await PainterBarcodeScan.create({
        painter: painterId,
        scanCode: code,
        scanType,
        scanStatus: "DUPLICATE",
      });

      let rewardPoints = 0;

      if (product) {
        const rewardTransaction = await RewardTransaction.findOne({
          user: painterId,
          userType: "PAINTER",
          rewardType: "POINTS",
          transactionType: "ADD",
          reference: code,
        }).sort({ createdAt: -1 });

        rewardPoints = rewardTransaction?.points || 0;
      }

      return res.status(200).json({
        success: true,
        scanStatus: "DUPLICATE",
        message: "This code has already been scanned",
        scan: duplicateScan,
        product: product
          ? {
              id: product._id,
              productName: product.productName,
              sku: product.sku,
              barcode: product.barcode,
              category: product.category,
              subCategory: product.subCategory,
              brand: product.brand,
              packingSize: product.packingSize,
              mrp: product.mrp,
            }
          : null,
        rewardPoints,
      });
    }

    // If barcode does not belong to an active product
    if (!product) {
      const invalidScan = await PainterBarcodeScan.create({
        painter: painterId,
        scanCode: code,
        scanType,
        scanStatus: "INVALID",
      });

      return res.status(200).json({
        success: true,
        scanStatus: "INVALID",
        message: "Invalid barcode. Product could not be verified.",
        scan: invalidScan,
        product: null,
        rewardPoints: 0,
      });
    }

    // Find reward transaction linked with this barcode
    const rewardTransaction = await RewardTransaction.findOne({
      user: painterId,
      userType: "PAINTER",
      rewardType: "POINTS",
      transactionType: "ADD",
      reference: code,
    }).sort({ createdAt: -1 });

    const rewardPoints = rewardTransaction?.points || 0;

    // Create valid scan
    const scan = await PainterBarcodeScan.create({
      painter: painterId,
      scanCode: code,
      scanType,
      scanStatus: "VALID",
    });

    return res.status(200).json({
      success: true,
      scanStatus: "VALID",
      message: "Barcode scanned and verified successfully",
      scan,
      product: {
        id: product._id,
        productName: product.productName,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        subCategory: product.subCategory,
        brand: product.brand,
        packingSize: product.packingSize,
        mrp: product.mrp,
      },
      rewardPoints,
    });
  } catch (error) {
    console.error("Barcode scan verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify barcode scan",
      error: error.message,
    });
  }
};

module.exports = {
  verifyBarcodeScan,
};