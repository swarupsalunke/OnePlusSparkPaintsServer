const Scheme = require("../models/schemeModel");

// Generate Scheme ID
const generateSchemeId = async () => {
  const year = new Date().getFullYear();

  const count = await Scheme.countDocuments();

  const number = String(count + 1).padStart(4, "0");

  return `SCHM-${year}-${number}`;
};


// Calculate status from dates
const getSchemeStatus = (startDate, endDate) => {
  const today = new Date();

  const start = new Date(startDate);
  const end = new Date(endDate);

  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (today < start) {
    return "UPCOMING";
  }

  if (today > end) {
    return "EXPIRED";
  }

  return "ACTIVE";
};


// Create Scheme
exports.createScheme = async (req, res) => {
  try {
    const {
      schemeName,
      description,
      schemeType,
      applicableTo,
      startDate,
      endDate,
      termsAndConditions,
    } = req.body;

    if (
      !schemeName ||
      !description ||
      !schemeType ||
      !applicableTo ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    const schemeId = await generateSchemeId();

    const banner = req.files?.banner
      ? `/uploads/schemes/${req.files.banner[0].filename}`
      : "";

    const pdf = req.files?.pdf
      ? `/uploads/schemes/${req.files.pdf[0].filename}`
      : "";

    const status = getSchemeStatus(startDate, endDate);

    const scheme = await Scheme.create({
      schemeId,
      schemeName,
      description,
      schemeType,
      applicableTo,
      banner,
      startDate,
      endDate,
      pdf,
      termsAndConditions,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Scheme created successfully",
      scheme,
    });
  } catch (error) {
    console.error("Create scheme error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create scheme",
      error: error.message,
    });
  }
};


// Get All Schemes
exports.getAllSchemes = async (req, res) => {
  try {
    const {
      search,
      schemeType,
      applicableTo,
      status,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    // Search
    if (search) {
      filter.$or = [
        {
          schemeName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          schemeId: {
            $regex: search,
            $options: "i",
          },
        },
        {
          schemeType: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Scheme Type
    if (schemeType && schemeType !== "ALL") {
      filter.schemeType = schemeType;
    }

    // Applicable To
    if (applicableTo && applicableTo !== "ALL") {
      filter.applicableTo = applicableTo;
    }

    // Status
    if (status && status !== "ALL") {
      filter.status = status;
    }

    // Date Range
    if (startDate || endDate) {
      filter.startDate = {};

      if (startDate) {
        filter.startDate.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.startDate.$lte = new Date(endDate);
      }
    }

    const schemes = await Scheme.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: schemes.length,
      schemes,
    });
  } catch (error) {
    console.error("Get schemes error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch schemes",
      error: error.message,
    });
  }
};


// Get Single Scheme
exports.getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

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
    res.status(500).json({
      success: false,
      message: "Failed to fetch scheme",
      error: error.message,
    });
  }
};


// Update Scheme
exports.updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    const {
      schemeName,
      description,
      schemeType,
      applicableTo,
      startDate,
      endDate,
      termsAndConditions,
    } = req.body;

    if (
      startDate &&
      endDate &&
      new Date(endDate) < new Date(startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    if (schemeName !== undefined) {
      scheme.schemeName = schemeName;
    }

    if (description !== undefined) {
      scheme.description = description;
    }

    if (schemeType !== undefined) {
      scheme.schemeType = schemeType;
    }

    if (applicableTo !== undefined) {
      scheme.applicableTo = applicableTo;
    }

    if (startDate !== undefined) {
      scheme.startDate = startDate;
    }

    if (endDate !== undefined) {
      scheme.endDate = endDate;
    }

    if (termsAndConditions !== undefined) {
      scheme.termsAndConditions = termsAndConditions;
    }

    if (req.files?.banner) {
      scheme.banner = `/uploads/schemes/${req.files.banner[0].filename}`;
    }

    if (req.files?.pdf) {
      scheme.pdf = `/uploads/schemes/${req.files.pdf[0].filename}`;
    }

    scheme.status = getSchemeStatus(
      scheme.startDate,
      scheme.endDate
    );

    await scheme.save();

    res.status(200).json({
      success: true,
      message: "Scheme updated successfully",
      scheme,
    });
  } catch (error) {
    console.error("Update scheme error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update scheme",
      error: error.message,
    });
  }
};


// Delete Scheme
exports.deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Scheme deleted successfully",
    });
  } catch (error) {
    console.error("Delete scheme error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete scheme",
      error: error.message,
    });
  }
};