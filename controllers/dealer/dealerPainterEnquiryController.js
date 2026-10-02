const PainterShopEnquiry = require("../../models/painter/PainterShopEnquiry");
const PainterProfile = require("../../models/painter/PainterProfile");

const getDealerPainterEnquiries = async (req, res) => {
  try {
    const dealerId =
      req.user?._id || req.user?.id || req.user?.userId;

    if (!dealerId) {
      return res.status(401).json({
        success: false,
        message: "Dealer authentication required",
      });
    }

    const enquiries = await PainterShopEnquiry.find({
      preferredDealer: dealerId,
    })
      .populate(
        "products.product",
        "productName sku mrp discountPrice image"
      )
      .sort({ createdAt: -1 });

    const formattedEnquiries = await Promise.all(
      enquiries.map(async (enquiry) => {
        const painterProfile = await PainterProfile.findOne({
          painterId: enquiry.painter,
        }).select(
          "name mobile email profileImage city serviceableArea tier"
        );
const imageUrl = painterProfile?.profileImage
  ? `${req.protocol}://${req.get("host")}${painterProfile.profileImage}`
  : "";
        

        return {
          _id: enquiry._id,
          createdAt: enquiry.createdAt,
          status: enquiry.status,
          remarks: enquiry.remarks,
          products: enquiry.products,
          painter: painterProfile
  ? {
      ...painterProfile.toObject(),
      profileImage: imageUrl,
    }
  : null
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: formattedEnquiries.length,
      enquiries: formattedEnquiries,
    });
  } catch (error) {
    console.error(
      "Get dealer painter enquiries error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch painter enquiries",
      error: error.message,
    });
  }
};

const updateDealerPainterEnquiryStatus = async (req, res) => {
  try {
    const dealerId =
      req.user?._id || req.user?.id || req.user?.userId;

    if (!dealerId) {
      return res.status(401).json({
        success: false,
        message: "Dealer authentication required",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "ACCEPTED",
      "REJECTED",
      "CONVERTED_TO_ORDER",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry status",
      });
    }

    const enquiry = await PainterShopEnquiry.findOneAndUpdate(
      {
        _id: id,
        preferredDealer: dealerId,
      },
      {
        status,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Painter enquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry status updated successfully",
      enquiry,
    });
  } catch (error) {
    console.error(
      "Update dealer painter enquiry status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update enquiry status",
      error: error.message,
    });
  }
};

module.exports = {
  getDealerPainterEnquiries,
  updateDealerPainterEnquiryStatus,
};