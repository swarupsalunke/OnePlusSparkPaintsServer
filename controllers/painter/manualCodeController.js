const PainterManualCode = require("../../models/painter/PainterManualCode");
const QR = require("../../models/superadmin/QR");
const RewardTransaction = require("../../models/superadmin/RewardTransaction");
const RewardWallet = require("../../models/superadmin/RewardWallet");

// POST /api/painter/manual-code
const verifyManualCode = async (req, res) => {
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

    const { verificationCode } = req.body || {};

    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    const code = String(verificationCode).trim();

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Verification code must be exactly 6 digits",
      });
    }

    // Find QR assigned to this painter
    // Populate product details for Scan Result page
    const qr = await QR.findOne({
      qrCode: code,
      painter: painterId,
    }).populate("product");

    // QR not found
    if (!qr) {
      const verification = await PainterManualCode.create({
        painter: painterId,
        verificationCode: code,
        verificationStatus: "INVALID",
      });

      return res.status(200).json({
        success: true,
        verificationStatus: "INVALID",
        message: "Invalid verification code",
        verification,
      });
    }

    // QR already used
    if (qr.status === "Used") {
      const verification = await PainterManualCode.create({
        painter: painterId,
        verificationCode: code,
        verificationStatus: "DUPLICATE",
      });

      return res.status(200).json({
        success: true,
        verificationStatus: "DUPLICATE",
        message: "This code has already been verified",
        verification,
      });
    }

    // QR blocked
    if (qr.status === "Blocked") {
      const verification = await PainterManualCode.create({
        painter: painterId,
        verificationCode: code,
        verificationStatus: "INVALID",
      });

      return res.status(200).json({
        success: true,
        verificationStatus: "INVALID",
        message: "This QR code is blocked",
        verification,
      });
    }

    // QR expired
    if (qr.expiryDate && new Date(qr.expiryDate) < new Date()) {
      const verification = await PainterManualCode.create({
        painter: painterId,
        verificationCode: code,
        verificationStatus: "INVALID",
      });

      return res.status(200).json({
        success: true,
        verificationStatus: "INVALID",
        message: "This QR code has expired",
        verification,
      });
    }

    // Create manual verification record
    const verification = await PainterManualCode.create({
      painter: painterId,
      verificationCode: code,
      verificationStatus: "VALID",
    });

    // Create reward transaction
    const rewardTransaction = await RewardTransaction.create({
      user: painterId,
      userType: "PAINTER",
      rewardType: "POINTS",
      transactionType: "ADD",
      points: qr.points,
      cashAmount: 0,
      status: "COMPLETED",
      description: "Reward earned from QR verification",
      reference: qr.qrCode,
    });

    // Find or create painter wallet
    let rewardWallet = await RewardWallet.findOne({
      user: painterId,
    });

    if (!rewardWallet) {
      rewardWallet = await RewardWallet.create({
        user: painterId,
        userType: "PAINTER",
        currentPoints: qr.points,
        currentCashBalance: 0,
        lifetimeEarnings: qr.points,
        redeemedAmount: 0,
        pendingRewards: 0,
      });
    } else {
      rewardWallet.currentPoints += qr.points;
      rewardWallet.lifetimeEarnings += qr.points;

      await rewardWallet.save();
    }

    // Mark QR as used
    qr.status = "Used";
    await qr.save();

    // Product details
    const product = qr.product || {};

    return res.status(200).json({
      success: true,
      verificationStatus: "VALID",
      message: "Code verified and reward added successfully",

      verification,

      // Scan Result data
      scan: {
        scanCode: qr.qrCode,
      },

      product: {
        productName: product.productName || "-",
        sku: product.sku || "-",
        barcode: product.barcode || qr.qrCode || "-",
        category: product.category || "-",
        brand: product.brand || "-",
        packingSize: product.packingSize || "-",
        mrp: product.mrp ?? 0,
      },

      rewardPoints: qr.points,

      rewardTransaction,
      rewardWallet,
    });
  } catch (error) {
    console.error("Manual code verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify manual code",
      error: error.message,
    });
  }
};

module.exports = {
  verifyManualCode,
};