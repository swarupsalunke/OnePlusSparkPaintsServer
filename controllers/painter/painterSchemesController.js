const Scheme = require("../../models/superadmin/schemeModel");

// Get All Painter Schemes
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


// Get Single Painter Scheme
exports.getPainterSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findOne({
      _id: req.params.id,
      applicableTo: {
        $in: ["PAINTERS", "BOTH"],
      },
    }).lean();

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    res.status(200).json({
      success: true,
      scheme,
    });
  } catch (error) {
    console.error("Get painter scheme by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch scheme details",
      error: error.message,
    });
  }
};

// Download Painter Scheme PDF
exports.downloadPainterSchemePdf = async (req, res) => {
  try {
    const scheme = await Scheme.findOne({
      _id: req.params.id,
      applicableTo: {
        $in: ["PAINTERS", "BOTH"],
      },
    }).lean();

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    if (!scheme.pdf) {
      return res.status(404).json({
        success: false,
        message: "Scheme PDF not available",
      });
    }

    const path = require("path");

    const relativePath = scheme.pdf.replace(/^[/\\]+/, "");

    const pdfPath = path.join(
      __dirname,
      "../../",
      relativePath
    );

    return res.download(
      pdfPath,
      `${scheme.schemeName || "scheme"}.pdf`,
      (error) => {
        if (error) {
          console.error(
            "Scheme PDF download error:",
            error
          );

          if (!res.headersSent) {
            return res.status(500).json({
              success: false,
              message: "Failed to download scheme PDF",
            });
          }
        }
      }
    );
  } catch (error) {
    console.error(
      "Download painter scheme PDF error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to download scheme PDF",
      error: error.message,
    });
  }
};