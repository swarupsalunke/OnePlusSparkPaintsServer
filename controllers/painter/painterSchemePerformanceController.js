const Scheme = require("../../models/superadmin/schemeModel");

// GET /api/painter/scheme-performance
const getPainterSchemePerformance = async (req, res) => {
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

    // Fetch schemes applicable to painters
    const schemes = await Scheme.find({
      applicableTo: {
        $in: ["PAINTERS", "BOTH"],
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    const performance = schemes.map((scheme) => ({
      _id: scheme._id,
      schemeId: scheme.schemeId,
      schemeName: scheme.schemeName,
      status: scheme.status,

      // Performance data will be connected
      // when target/achievement source is available.
      target: 0,
      achieved: 0,
      achievementPercentage: 0,
    }));

    const totalSchemes = performance.length;

    // Currently no achievement source exists,
    // so all performance counts remain zero.
    const achieved = 0;
    const inProgress = 0;
    const remaining = totalSchemes;

    return res.status(200).json({
      success: true,

      summary: {
        totalSchemes,
        achieved,
        inProgress,
        remaining,
      },

      performance,
    });
  } catch (error) {
    console.error(
      "Get Painter Scheme Performance Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch scheme performance",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterSchemePerformance,
};