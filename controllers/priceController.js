const Price = require("../models/Price");

const getPriceProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      priceListType,
      effectiveDate,
    } = req.query;

    const filter = {};


    // Search
    if (search) {
      filter.$or = [
        {
          productName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          sku: {
            $regex: search,
            $options: "i",
          },
        },
        {
          barcode: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Category
    if (category) {
      filter.category = category;
    }

    // Brand
    if (brand) {
      filter.brand = brand;
    }

    // Price List
    if (priceListType) {
      filter.priceListType = priceListType;
    }

    // Effective Date
    if (effectiveDate) {
      const start = new Date(effectiveDate);
      const end = new Date(effectiveDate);

      end.setDate(end.getDate() + 1);

      filter.effectiveDate = {
        $gte: start,
        $lt: end,
      };
    }

    const prices = await Price.find(filter)
      .sort({
        effectiveDate: -1,
        createdAt: -1,
      })
      .lean();

    res.status(200).json({
      success: true,
      count: prices.length,
      products: prices,
    });
  } catch (error) {
    console.error("Get price products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch price products",
    });
  }
};

// ======================================================
// CREATE PRICE REVISION
// ======================================================

const createPrice = async (req, res) => {
  try {
    const {
      productName,
      sku,
      barcode,
      category,
      brand,
      packingSize,
      priceListType,
      customerId,
      basePrice,
      gstPercent,
      discountPercent,
      discountPrice,
      effectiveDate,
    } = req.body;

    if (
      !productName ||
      !sku ||
      !category ||
      !brand ||
      !packingSize ||
      !priceListType ||
      basePrice === undefined ||
      discountPercent === undefined ||
      discountPrice === undefined ||
      !effectiveDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required price fields",
      });
    }

    const price = await Price.create({
      productName,
      sku,
      barcode: barcode || "",
      category,
      brand,
      packingSize,
      priceListType,
      customerId: customerId || null,
      basePrice,
      gstPercent: gstPercent || 0,
      discountPercent,
      discountPrice,
      effectiveDate,
      approvalStatus: "PENDING",
      createdBy:
        req.user?.id ||
        req.user?._id ||
        null,
    });

    res.status(201).json({
      success: true,
      message: "Price list created successfully",
      price,
    });
  } catch (error) {
    console.error("Create price error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create price list",
    });
  }
};


const updatePrice = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      productName,
      sku,
      barcode,
      category,
      brand,
      packingSize,
      priceListType,
      customerId,
      basePrice,
      gstPercent,
      discountPercent,
      discountPrice,
      effectiveDate,
    } = req.body;

    const price = await Price.findById(id);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: "Price list not found",
      });
    }

    price.productName = productName;
    price.sku = sku;
    price.barcode = barcode || "";
    price.category = category;
    price.brand = brand;
    price.packingSize = packingSize;
    price.priceListType = priceListType;
    price.customerId = customerId || null;
    price.basePrice = basePrice;
    price.gstPercent = gstPercent || 0;
    price.discountPercent = discountPercent;
    price.discountPrice = discountPrice;
    price.effectiveDate = effectiveDate;

    // Updated price needs approval again
    price.approvalStatus = "PENDING";
    price.approvedBy = null;
    price.approvedAt = null;
    price.rejectionReason = "";

    await price.save();

    res.status(200).json({
      success: true,
      message: "Price list updated successfully",
      price,
    });
  } catch (error) {
    console.error("Update price error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update price list",
    });
  }
};

// ======================================================
// GET PRICE BY ID
// ======================================================

const getPriceById = async (req, res) => {
  try {
    const { id } = req.params;

    const price = await Price.findById(id)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email");

    if (!price) {
      return res.status(404).json({
        success: false,
        message: "Price list not found",
      });
    }

    res.status(200).json({
      success: true,
      price,
    });
  } catch (error) {
    console.error("Get price by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch price list",
    });
  }
};


// ======================================================
// DELETE PRICE
// ======================================================

const deletePrice = async (req, res) => {
  try {
    const { id } = req.params;

    const price = await Price.findById(id);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: "Price list not found",
      });
    }

    await Price.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Price list deleted successfully",
    });
  } catch (error) {
    console.error("Delete price error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete price list",
    });
  }
};


// ======================================================
// GET PENDING PRICE REVISIONS
// ======================================================

const getPendingPrices = async (req, res) => {
  try {
    const prices = await Price.find({
      approvalStatus: "PENDING",
    })
      .populate(
        "product",
        "productName sku category brand packingSize mrp"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prices.length,
      prices,
    });
  } catch (error) {
    console.error(
      "Get pending prices error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch pending prices",
    });
  }
};


// ======================================================
// APPROVE PRICE
// ======================================================

const approvePrice = async (req, res) => {
  try {
    const { id } = req.params;

    const price = await Price.findById(id);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: "Price revision not found",
      });
    }

    if (price.approvalStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          "This price revision is already processed",
      });
    }

    price.approvalStatus = "APPROVED";

    price.approvedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    price.approvedAt = new Date();

    await price.save();

    res.status(200).json({
      success: true,
      message:
        "Price revision approved successfully",
      price,
    });
  } catch (error) {
    console.error(
      "Approve price error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to approve price",
    });
  }
};


// ======================================================
// REJECT PRICE
// ======================================================

const rejectPrice = async (req, res) => {
  try {
    const { id } = req.params;

    const { rejectionReason } = req.body;

    const price = await Price.findById(id);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: "Price revision not found",
      });
    }

    if (price.approvalStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          "This price revision is already processed",
      });
    }

    price.approvalStatus = "REJECTED";

    price.rejectionReason =
      rejectionReason || "";

    price.approvedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    price.approvedAt = new Date();

    await price.save();

    res.status(200).json({
      success: true,
      message:
        "Price revision rejected successfully",
      price,
    });
  } catch (error) {
    console.error(
      "Reject price error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to reject price",
    });
  }
};


// ======================================================
// PRICE HISTORY
// ======================================================

const getPriceHistory = async (req, res) => {
  try {
    const { priceId } = req.params;

    const price = await Price.findById(priceId)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email");

    if (!price) {
      return res.status(404).json({
        success: false,
        message: "Price list not found",
      });
    }

    const prices = await Price.find({
      sku: price.sku,
      productName: price.productName,
    })
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prices.length,
      prices,
    });
  } catch (error) {
    console.error("Get price history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch price history",
    });
  }
};


// ======================================================
// PRICE STATISTICS
// ======================================================

const getPriceStats = async (req, res) => {
  try {
    const totalProducts = await Price.distinct("sku", {
      approvalStatus: "APPROVED",
    });

    const priceListResult = await Price.distinct(
      "priceListType",
      {
        approvalStatus: "APPROVED",
      }
    );

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const updatedToday = await Price.countDocuments({
      approvalStatus: "APPROVED",
      approvedAt: {
        $gte: startOfDay,
      },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const priceChanges = await Price.countDocuments({
      approvalStatus: "APPROVED",
      approvedAt: {
        $gte: startOfMonth,
      },
    });

    const discountResult = await Price.aggregate([
      {
        $match: {
          approvalStatus: "APPROVED",
        },
      },
      {
        $group: {
          _id: null,
          averageDiscount: {
            $avg: "$discountPercent",
          },
        },
      },
    ]);

    const averageDiscount = discountResult.length
      ? Number(
        discountResult[0].averageDiscount
      ).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalProducts: totalProducts.length,
        priceLists: priceListResult.length,
        updatedToday,
        priceChanges,
        averageDiscount,
      },
    });
  } catch (error) {
    console.error("Get price stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch price statistics",
    });
  }
};


// ======================================================
// BULK PRICE UPDATE
// ======================================================

const bulkCreatePrices = async (req, res) => {
  try {
    const { prices } = req.body;

    if (!Array.isArray(prices) || prices.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Prices array is required",
      });
    }

    const formattedPrices = prices.map((item) => ({
      product: item.product,
      priceListType: item.priceListType,
      customerId: item.customerId || null,
      basePrice: item.basePrice,
      gstPercent: item.gstPercent || 0,
      discountPercent:
        item.discountPercent || 0,
      discountPrice: item.discountPrice,
      effectiveDate: item.effectiveDate,
      approvalStatus: "PENDING",
      createdBy:
        req.user?.id ||
        req.user?._id ||
        null,
    }));

    const createdPrices =
      await Price.insertMany(
        formattedPrices
      );

    res.status(201).json({
      success: true,
      message:
        "Bulk price revisions submitted for approval",
      count: createdPrices.length,
      prices: createdPrices,
    });
  } catch (error) {
    console.error(
      "Bulk price error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create bulk prices",
    });
  }
};


module.exports = {
  getPriceProducts,
  createPrice,
  updatePrice,
  deletePrice,
  getPendingPrices,
  approvePrice,
  rejectPrice,
  getPriceHistory,
  getPriceStats,
  bulkCreatePrices,
  getPriceById
};