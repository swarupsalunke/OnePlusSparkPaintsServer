const Scheme = require("../../models/superadmin/schemeModel");

// Get Schemes for Painter
exports.getPainterSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find({
      applicableTo: {
        $in: ["PAINTERS", "BOTH"],
      },
      status: "ACTIVE",
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: schemes.length,
      schemes,
    });
  } catch (error) {
    console.error("Get painter schemes error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch painter schemes",
      error: error.message,
    });
  }
};