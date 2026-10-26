
const mongoose = require("mongoose");
const SalesOrder = require("../../models/salesExecutive/SalesOrder");
const Product = require("../../models/superadmin/Product");
const User = require("../../models/superadmin/User");
const SalesExecutiveLead = require("../../models/salesExecutive/SalesExecutiveLead");

const generateOrderId = () =>
  `SEO-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

// PRODUCT CATALOGUE
const getOrderProducts = async (req, res) => {
  try {
    const { search = "", category = "", group = "", brand = "" } = req.query;
    const filter = { status: "ACTIVE" };

    if (category) filter.category = category;
    if (group) filter.group = group;
    if (brand) filter.brand = brand;

    if (search.trim()) {
      const regex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      filter.$or = [
        { productName: regex },
        { sku: regex },
        { barcode: regex },
        { brand: regex },
      ];
    }

    const products = await Product.find(filter).sort({ productName: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product catalogue",
      error: error.message,
    });
  }
};

// CREATE ORDER
const createSalesOrder = async (req, res) => {
  try {
    const salesExecutiveId = req.user?.userId;
    const {
      dealer,
      lead,
      items,
      remarks = "",
      status = "Submitted",
    } = req.body;

    if (!salesExecutiveId) {
      return res.status(401).json({
        success: false,
        message: "Sales Executive authentication required",
      });
    }

    if (!mongoose.isValidObjectId(dealer)) {
      return res.status(400).json({
        success: false,
        message: "Valid dealer is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Add at least one product",
      });
    }

    if (!["Draft", "Submitted"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "New order can only be Draft or Submitted",
      });
    }

    const dealerUser = await User.findById(dealer);
    if (!dealerUser) {
      return res.status(404).json({
        success: false,
        message: "Dealer not found",
      });
    }


    if (!mongoose.isValidObjectId(lead)) {
      return res.status(400).json({
        success: false,
        message: "Valid lead is required",
      });
    }

    const selectedLead = await SalesExecutiveLead.findById(lead);

    if (!selectedLead) {
      return res.status(404).json({
        success: false,
        message: "Selected lead not found",
      });
    }


    const productIds = items.map((item) => item.product);
    if (productIds.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const uniqueIds = [...new Set(productIds.map(String))];
    const products = await Product.find({
      _id: { $in: uniqueIds },
      status: "ACTIVE",
    });
    const productMap = new Map(products.map((product) => [String(product._id), product]));

    if (productMap.size !== uniqueIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products are unavailable",
      });
    }

    let subtotal = 0;
    let totalDiscount = 0;

    const orderItems = items.map((item) => {
      const product = productMap.get(String(item.product));
      const quantity = Number(item.quantity);
      const discount = Number(item.discount || 0);

      if (!Number.isFinite(quantity) || quantity < 1 || !Number.isInteger(quantity)) {
        throw new Error(`Invalid quantity for ${product.productName}`);
      }

      // Temporary base price: use product discountPrice.
      // Replace with dealer-specific pricing when that model is confirmed.
      const unitPrice = Number(product.discountPrice ?? product.mrp);

      if (!Number.isFinite(discount) || discount < 0 || discount > unitPrice * quantity) {
        throw new Error(`Invalid discount for ${product.productName}`);
      }

      if (quantity > Number(product.stockQuantity || 0)) {
        throw new Error(`Insufficient stock for ${product.productName}`);
      }

      const grossTotal = unitPrice * quantity;
      const lineTotal = grossTotal - discount;

      subtotal += grossTotal;
      totalDiscount += discount;

      return {
        product: product._id,
        productName: product.productName,
        sku: product.sku || "",
        quantity,
        unit: String(item.unit || product.packingSize || "Unit"),
        unitPrice,
        discount,
        lineTotal,
      };
    });


    const order = await SalesOrder.create({
      orderId: generateOrderId(),
      dealer,
      lead: selectedLead._id,
      salesExecutive: salesExecutiveId,
      items: orderItems,
      subtotal,
      totalDiscount,
      totalAmount: subtotal - totalDiscount,
      remarks,
      status,
      trackingHistory: [{ status, date: new Date() }],
    });



    const populatedOrder = await SalesOrder.findById(order._id)
      .populate("dealer", "name email")
      .populate("lead", "customerName contactDetails businessType")
      .populate("salesExecutive", "name email")
      .populate("items.product");


    return res.status(201).json({
      success: true,
      message: "Sales order created successfully",
      order: populatedOrder,
    });

  } catch (error) {
    console.error("Create Sales Order Error:", error);

    return res.status(400).json({
      success: false,
      message: "Failed to create sales order",
      error: error.message,
    });
  }

};

// ORDER HISTORY
const getSalesOrders = async (req, res) => {
  try {
    const filter = {};

    // Sales Executives see only orders they created.
    if (req.user?.userId) filter.salesExecutive = req.user.userId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.dealer && mongoose.isValidObjectId(req.query.dealer)) {
      filter.dealer = req.query.dealer;
    }

    const orders = await SalesOrder.find(filter)
      .populate("dealer", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales orders",
      error: error.message,
    });
  }
};

// ORDER DETAILS
const getSalesOrderById = async (req, res) => {
  try {
    const order = await SalesOrder.findOne({
      _id: req.params.id,
      salesExecutive: req.user?.userId,
    })
      .populate("dealer", "name email")
      .populate("salesExecutive", "name email")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};

// UPDATE ORDER STATUS
const updateSalesOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = [
      "Draft", "Submitted", "Approved", "Processing",
      "Dispatched", "Delivered", "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await SalesOrder.findOne({
      _id: req.params.id,
      salesExecutive: req.user?.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Status changes should normally be performed by authorized approvers.
    // Sales Executive may only save Draft or submit a Draft.
    if (
      !(
        (order.status === "Draft" && ["Draft", "Submitted"].includes(status)) ||
        (status === "Cancelled" && ["Submitted"].includes(order.status))
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to make this status change",
      });
    }

    order.status = status;
    order.trackingHistory.push({ status, date: new Date() });
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

module.exports = {
  getOrderProducts,
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  updateSalesOrderStatus,
};
