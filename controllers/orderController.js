const Order = require("../models/Order");

const createOrder = async (req, res) => {
    try {
        const {

            orderDate,
            dealer,
            salesExecutive,
            orderType,
            items,
            totalAmount,
            status,
            paymentStatus,
        } = req.body;

        const lastOrder = await Order.findOne()
            .sort({ createdAt: -1 });

        let nextNumber = 1;

        if (lastOrder?.orderNumber) {
            const match = lastOrder.orderNumber.match(/\d+$/);

            if (match) {
                nextNumber = Number(match[0]) + 1;
            }
        }

        const orderNumber = `ORD-${String(nextNumber).padStart(3, "0")}`;

        const order = await Order.create({
            orderNumber,
            orderDate,
            dealer,
            salesExecutive,
            orderType,
            items,
            totalAmount,
            status,
            paymentStatus,
        });

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order,
        });

    } catch (error) {
        console.error("Create order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message,
        });
    }
};


// ==========================================
// GET ALL ORDERS
// ==========================================

const getOrders = async (req, res) => {
    try {
        const {
            search,
            status,
            orderType,
            dealer,
            salesExecutive,
            startDate,
            endDate,
        } = req.query;

        const filter = {};


        // STATUS FILTER
        if (status) {
            filter.status = status;
        }


        // ORDER TYPE FILTER
        if (orderType) {
            filter.orderType = orderType;
        }


        // DEALER FILTER
        if (dealer) {
            filter.dealer = dealer;
        }


        // SALES EXECUTIVE FILTER
        if (salesExecutive) {
            filter.salesExecutive = salesExecutive;
        }


        // DATE FILTER
        if (startDate || endDate) {
            filter.orderDate = {};

            if (startDate) {
                filter.orderDate.$gte = new Date(startDate);
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                filter.orderDate.$lte = end;
            }
        }


        let query = Order.find(filter)
            .populate("dealer", "name email phone")
            .populate("salesExecutive", "name email")
            .populate("items.product", "name sku price")
            .sort({
                orderDate: -1,
                createdAt: -1,
            });


        const orders = await query;


        // SEARCH
        let filteredOrders = orders;

        if (search) {
            const searchText = search.toLowerCase();

            filteredOrders = orders.filter((order) => {

                const orderNumber =
                    order.orderNumber?.toLowerCase() || "";

                const dealerName =
                    order.dealer?.name?.toLowerCase() || "";

                const executiveName =
                    order.salesExecutive?.name?.toLowerCase() || "";

                return (
                    orderNumber.includes(searchText) ||
                    dealerName.includes(searchText) ||
                    executiveName.includes(searchText)
                );
            });
        }


        res.status(200).json({
            success: true,
            count: filteredOrders.length,
            orders: filteredOrders,
        });

    } catch (error) {
        console.error("Get orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
};


// ==========================================
// GET SINGLE ORDER
// ==========================================

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("dealer", "name email phone")
            .populate("salesExecutive", "name email")
            .populate("items.product", "name sku price");

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
        console.error("Get order by ID error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch order",
            error: error.message,
        });
    }
};


// ==========================================
// UPDATE ORDER
// ==========================================

const updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Order updated successfully",
            order,
        });

    } catch (error) {
        console.error("Update order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update order",
            error: error.message,
        });
    }
};


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Draft",
            "New",
            "Processing",
            "Approved",
            "Dispatched",
            "Delivered",
            "Cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status",
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order,
        });

    } catch (error) {
        console.error("Update order status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: error.message,
        });
    }
};


// ==========================================
// DELETE ORDER
// ==========================================

const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(
            req.params.id
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Order deleted successfully",
        });

    } catch (error) {
        console.error("Delete order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete order",
            error: error.message,
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
};