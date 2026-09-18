const PainterManualCode = require("../../models/painter/PainterManualCode");

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

    const existingCode = await PainterManualCode.findOne({
      verificationCode: code,
    });

    if (existingCode) {
      const duplicateCode = await PainterManualCode.create({
        painter: painterId,
        verificationCode: code,
        verificationStatus: "DUPLICATE",
      });

      return res.status(200).json({
        success: true,
        verificationStatus: "DUPLICATE",
        message: "This code has already been verified",
        verification: duplicateCode,
      });
    }

    const verification = await PainterManualCode.create({
      painter: painterId,
      verificationCode: code,
      verificationStatus: "VALID",
    });

    return res.status(200).json({
      success: true,
      verificationStatus: "VALID",
      message: "Code verified successfully",
      verification,
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