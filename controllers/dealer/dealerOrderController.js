const DealerOrder = require("../../models/dealer/DealerOrder");
const DealerCart = require("../../models/dealer/DealerCart");

const generateOrderId = () => {
  return `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// CREATE ORDER FROM CART
const createDealerOrder = async (req, res) => {
  try {
    const dealerId = req.user.userId;

    const cart = await DealerCart.findOne({ dealer: dealerId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const items = cart.items.map((item) => {
      const product = item.product;
      const price = product.discountPrice ?? product.mrp ?? 0;

      return {
        product: product._id,
        productName: product.productName,
        sku: product.sku || "",
        quantity: item.quantity,
        price,
        total: price * item.quantity,
      };
    });

    const totalAmount = items.reduce(
      (total, item) => total + item.total,
      0
    );

    const order = await DealerOrder.create({
      orderId: generateOrderId(),
      dealer: dealerId,
      items,
      totalAmount,
      status: "Submitted",
      trackingHistory: [
        {
          status: "Submitted",
          date: new Date(),
        },
      ],
    });

    cart.items = [];
    await cart.save();

    const populatedOrder = await DealerOrder.findById(order._id).populate(
      "items.product"
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create dealer order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  }
};

// GET DEALER ORDERS
const getDealerOrders = async (req, res) => {
  try {
    const dealerId = req.user.userId;

    const orders = await DealerOrder.find({ dealer: dealerId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get dealer orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// GET DEALER ORDER BY ID
const getDealerOrderById = async (req, res) => {
  try {
    const dealerId = req.user.userId;
    const { id } = req.params;

    const order = await DealerOrder.findOne({
      _id: id,
      dealer: dealerId,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get dealer order details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};

// CANCEL DEALER ORDER
const cancelDealerOrder = async (req, res) => {
  try {
    const dealerId = req.user.userId;
    const { id } = req.params;

    const order = await DealerOrder.findOne({
      _id: id,
      dealer: dealerId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered order cannot be cancelled",
      });
    }

    order.status = "Cancelled";

    order.trackingHistory.push({
      status: "Cancelled",
      date: new Date(),
    });

    await order.save();

    const populatedOrder = await DealerOrder.findById(order._id).populate(
      "items.product"
    );

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Cancel dealer order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

module.exports = {
  createDealerOrder,
  getDealerOrders,
  getDealerOrderById,
  cancelDealerOrder,
};