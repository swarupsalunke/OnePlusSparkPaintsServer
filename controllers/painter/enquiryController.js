const PainterEnquiry = require("../../models/painter/PainterEnquiry");

// POST /api/painter/enquiries
const createEnquiry = async (req, res) => {
  try {
    const painterId =
      req.user?._id || req.user?.id || req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const { product, quantity, message } = req.body;

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product is required",
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const enquiry = await PainterEnquiry.create({
      painter: painterId,
      product,
      quantity,
      message: message || "",
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Product enquiry submitted successfully",
      enquiry,
    });
  } catch (error) {
    console.error("Create painter enquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit product enquiry",
      error: error.message,
    });
  }
};

module.exports = {
  createEnquiry,
};