const PainterBarcodeScan = require("../../models/painter/PainterBarcodeScan");
const Product = require("../../models/superadmin/Product");
const ManufacturingBatch = require("../../models/superadmin/ManufacturingBatch");
const RewardTransaction = require("../../models/superadmin/RewardTransaction");

// GET /api/painter/product-verification/:scanCode
const getProductVerification = async (req, res) => {
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

    const { scanCode } = req.params;

    if (!scanCode || !scanCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Scan code is required",
      });
    }

    const code = scanCode.trim();

    // Find scan history for this painter
    const scan = await PainterBarcodeScan.findOne({
      painter: painterId,
      scanCode: code,
    }).sort({ createdAt: -1 });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan record not found",
      });
    }

    // Find product using barcode
    const product = await Product.findOne({
      barcode: code,
      status: "ACTIVE",
    });

    if (!product) {
      return res.status(200).json({
        success: true,
        verification: {
          product: null,
          batch: null,
          rewardPoints: 0,
          checks: {
            qrAuthenticity: "Failed",
            duplicateScan:
              scan.scanStatus === "DUPLICATE"
                ? "Duplicate"
                : "Clear",
            expiryValidation: null,
            deviceRisk: null,
          },
        },
      });
    }

    // Find latest manufacturing batch for this product
    const batch = await ManufacturingBatch.findOne({
      product: product._id,
    }).sort({ batchDate: -1 });

    // Find reward transaction linked with this scan code
    const rewardTransaction = await RewardTransaction.findOne({
      user: painterId,
      userType: "PAINTER",
      rewardType: "POINTS",
      transactionType: "ADD",
      reference: code,
    }).sort({ createdAt: -1 });

    const rewardPoints = rewardTransaction?.points || 0;

    return res.status(200).json({
      success: true,

      verification: {
        product: {
          id: product._id,
          productName: product.productName,
          sku: product.sku,
          barcode: product.barcode,
          category: product.category,
          brand: product.brand,
          packingSize: product.packingSize,
          mrp: product.mrp,
        },

        batch: batch
          ? {
              id: batch._id,
              batchNumber: batch.batchNumber,
              batchDate: batch.batchDate,
              status: batch.status,
            }
          : null,

        rewardPoints,

        checks: {
          qrAuthenticity:
            product.barcode === code
              ? "Passed"
              : "Failed",

          duplicateScan:
            scan.scanStatus === "DUPLICATE"
              ? "Duplicate"
              : "Clear",

          expiryValidation: null,

          deviceRisk: null,
        },
      },
    });
  } catch (error) {
    console.error(
      "Product verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify product",
      error: error.message,
    });
  }
};

module.exports = {
  getProductVerification,
};