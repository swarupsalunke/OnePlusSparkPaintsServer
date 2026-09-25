const PainterProfile = require("../../models/painter/PainterProfile");

const editPainterProfile = async (req, res) => {
  try {
    const painterId = req.user.userId;

    const {
      name,
      mobile,
      email,
      serviceableArea,
      profileImage,
    } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name and mobile are required",
      });
    }

    const profile = await PainterProfile.findOneAndUpdate(
      { painterId },
      {
        name,
        mobile,
        email,
        serviceableArea,
        profileImage,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Painter profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Edit Painter Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to edit painter profile",
      error: error.message,
    });
  }
};

module.exports = {
  editPainterProfile,
};