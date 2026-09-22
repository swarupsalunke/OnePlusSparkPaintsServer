const Scheme = require("../../models/superadmin/schemeModel");

// Get All Painter Offers
exports.getPainterOffers = async (req, res) => {
  try {
    const offers = await Scheme.find({
      applicableTo: { $in: ["PAINTERS", "BOTH"] },
      status: "ACTIVE",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Get offer types dynamically from database
    const offerTypes = [
      ...new Set(
        offers
          .map((offer) => offer.schemeType)
          .filter(Boolean)
      ),
    ];

    res.status(200).json({
      success: true,
      count: offers.length,
      offerTypes,
      offers,
    });
  } catch (error) {
    console.error("Get painter offers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch painter offers",
      error: error.message,
    });
  }
};


// Get Single Painter Offer
exports.getPainterOfferById = async (req, res) => {
  try {
    const offer = await Scheme.findOne({
      _id: req.params.id,
      applicableTo: { $in: ["PAINTERS", "BOTH"] },
    }).lean();

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      offer,
    });
  } catch (error) {
    console.error("Get painter offer by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch offer details",
      error: error.message,
    });
  }
};