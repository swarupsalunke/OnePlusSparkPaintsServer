const OrderReturn = require("../../models/superadmin/OrderReturn");
const Order = require("../../models/superadmin/Order");

// CREATE ORDER RETURN
const createOrderReturn = async (req, res) => {
    try {
        const {
            order,
            items,
            returnReason,
            remarks,
        } = req.body;

        if (!order || !items?.length || !returnReason) {
            return res.status(400).json({
                success: false,
                message: "Order, return items and reason are required",
            });
        }

        const existingOrder = await Order.findById(order);

        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (existingOrder.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled orders cannot be returned",
            });
        }

        let returnAmount = 0;

        for (const returnItem of items) {
            const originalItem = existingOrder.items.find(
                (item) =>
                    item.product.toString() === returnItem.product
            );

            if (!originalItem) {
                return res.status(400).json({
                    success: false,
                    message: "Product does not belong to this order",
                });
            }

            if (
                !Number.isInteger(Number(returnItem.quantity)) ||
                Number(returnItem.quantity) < 1 ||
                Number(returnItem.quantity) > originalItem.quantity
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid return quantity",
                });
            }

            const price = originalItem.price;
            const total = price * Number(returnItem.quantity);

            returnItem.price = price;
            returnItem.total = total;

            returnAmount += total;
        }

        const orderReturn = await OrderReturn.create({
            order: existingOrder._id,
            dealer: existingOrder.dealer,
            items,
            returnReason,
            remarks,
            returnAmount,
        });

        res.status(201).json({
            success: true,
            message: "Order return created successfully",
            orderReturn,
        });

    } catch (error) {
        console.error("Create order return error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create order return",
            error: error.message,
        });
    }
};


// GET ALL ORDER RETURNS
const getOrderReturns = async (req, res) => {
    try {
        const returns = await OrderReturn.find()
            .populate("order", "orderNumber orderDate status totalAmount")
            .populate("dealer", "name email")
            .populate("items.product", "name sku")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: returns.length,
            returns,
        });

    } catch (error) {
        console.error("Get order returns error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch order returns",
            error: error.message,
        });
    }
};


// UPDATE RETURN STATUS
const updateReturnStatus = async (req, res) => {
    try {
        const { returnStatus, refundStatus } = req.body;

        const allowedReturnStatuses = [
            "Pending",
            "Approved",
            "Rejected",
            "Completed",
        ];

        const allowedRefundStatuses = [
            "Pending",
            "Refunded",
            "Not Applicable",
        ];

        if (
            returnStatus &&
            !allowedReturnStatuses.includes(returnStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid return status",
            });
        }

        if (
            refundStatus &&
            !allowedRefundStatuses.includes(refundStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid refund status",
            });
        }

        const orderReturn = await OrderReturn.findById(
            req.params.id
        );

        if (!orderReturn) {
            return res.status(404).json({
                success: false,
                message: "Order return not found",
            });
        }

        if (returnStatus) {
            orderReturn.returnStatus = returnStatus;
        }

        if (refundStatus) {
            orderReturn.refundStatus = refundStatus;
        }

        await orderReturn.save();

        res.status(200).json({
            success: true,
            message: "Return status updated successfully",
            orderReturn,
        });

    } catch (error) {
        console.error("Update return status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update return status",
            error: error.message,
        });
    }
};


module.exports = {
    createOrderReturn,
    getOrderReturns,
    updateReturnStatus,
};