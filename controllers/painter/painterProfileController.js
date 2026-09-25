const PainterProfile = require("../../models/painter/PainterProfile");

const getMyProfile = async (req, res) => {
  try {
    const painterId = req.user.userId;

    let profile = await PainterProfile.findOne({
      painterId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Painter profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get Painter Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch painter profile",
      error: error.message,
    });
  }
};

const createPainterProfile = async (req, res) => {
  try {
    
    const painterId = req.user.userId;

    const existingProfile = await PainterProfile.findOne({
      painterId,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Painter profile already exists",
      });
    }

    const {
      name,
      mobile,
      email,
      profileImage,
      city,
      serviceableArea,
      tier,
      kycStatus,
      joinedAt,
    } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name and mobile are required",
      });
    }

    const profile = await PainterProfile.create({
      painterId,
      name,
      mobile,
      email,
      profileImage,
      city,
      serviceableArea,
      tier,
      kycStatus,
      joinedAt,
    });

    res.status(201).json({
      success: true,
      message: "Painter profile created successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Create Painter Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create painter profile",
      error: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  createPainterProfile,
};