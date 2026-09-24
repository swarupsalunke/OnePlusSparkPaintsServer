const PainterShopEnquiry = require("../../models/painter/PainterShopEnquiry");

// POST /api/painter/shop-enquiries
const createShopEnquiry = async (req, res) => {
  try {
    const painterId =
      req.user?._id || req.user?.id || req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const { products, preferredDealer, remarks } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product is required",
      });
    }

    for (const item of products) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: "Product is required",
        });
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Valid quantity is required",
        });
      }
    }

    if (!preferredDealer) {
      return res.status(400).json({
        success: false,
        message: "Preferred dealer is required",
      });
    }

    const enquiry = await PainterShopEnquiry.create({
      painter: painterId,
      products,
      preferredDealer,
      remarks: remarks || "",
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Shop enquiry submitted successfully",
      enquiry,
    });
  } catch (error) {
    console.error("Create painter shop enquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit shop enquiry",
      error: error.message,
    });
  }
};

// GET /api/painter/shop-enquiries
const getShopEnquiries = async (req, res) => {
  try {
    const painterId =
      req.user?._id || req.user?.id || req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const enquiries = await PainterShopEnquiry.find({
      painter: painterId,
    })
      .populate(
        "products.product",
        "productName discountPrice mrp"
      )
      .populate(
        "preferredDealer",
        "name"
      )
      .sort({ createdAt: -1 });

    const formattedEnquiries = enquiries.map((enquiry) => {
      let value = 0;

      enquiry.products.forEach((item) => {
        const price =
          Number(item.product?.discountPrice) ||
          Number(item.product?.mrp) ||
          0;

        value += price * Number(item.quantity || 0);
      });

      return {
        _id: enquiry._id,
        createdAt: enquiry.createdAt,
        products: enquiry.products,
        value,
        status: enquiry.status,
        preferredDealer: enquiry.preferredDealer,
      };
    });

    return res.status(200).json({
      success: true,
      enquiries: formattedEnquiries,
    });
  } catch (error) {
    console.error(
      "Get painter shop enquiries error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop enquiries",
    });
  }
};

// GET /api/painter/shop-enquiries/:id
const getShopEnquiryById = async (req, res) => {
  try {
    const painterId =
      req.user?._id || req.user?.id || req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const { id } = req.params;

    const enquiry = await PainterShopEnquiry.findOne({
      _id: id,
      painter: painterId,
    })
      .populate(
        "products.product",
        "productName discountPrice mrp"
      )
      .populate(
        "preferredDealer",
        "name"
      );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Shop enquiry not found",
      });
    }

    let value = 0;

    enquiry.products.forEach((item) => {
      const price =
        Number(item.product?.discountPrice) ||
        Number(item.product?.mrp) ||
        0;

      value += price * Number(item.quantity || 0);
    });

    return res.status(200).json({
      success: true,
      enquiry: {
        _id: enquiry._id,
        createdAt: enquiry.createdAt,
        products: enquiry.products,
        value,
        status: enquiry.status,
        preferredDealer: enquiry.preferredDealer,
        remarks: enquiry.remarks,
      },
    });
  } catch (error) {
    console.error(
      "Get painter shop enquiry details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop enquiry details",
    });
  }
};

module.exports = {
  createShopEnquiry,
  getShopEnquiries,
  getShopEnquiryById,
};