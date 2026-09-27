const PainterProfile = require("../../models/painter/PainterProfile");

const editPainterProfile = async (req, res) => {
  try {
    const painterId = req.user.userId;

    const {
      name,
      mobile,
      email,
      serviceableArea,
    } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name and mobile are required",
      });
    }

    const profile = await PainterProfile.findOne({
      painterId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Painter profile not found",
      });
    }

    profile.name = name.trim();
    profile.mobile = mobile.trim();
    profile.email = email
      ? email.trim().toLowerCase()
      : "";
    profile.serviceableArea = serviceableArea
      ? serviceableArea.trim()
      : "";

    // Profile image uploaded through Multer
    if (req.file) {
      profile.profileImage = `/uploads/painter/${req.file.filename}`;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Edit Painter Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to edit painter profile",
      error: error.message,
    });
  }
};

module.exports = {
  editPainterProfile,
};