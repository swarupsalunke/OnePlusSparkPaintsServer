const mongoose = require("mongoose");
const Collection = require("../../models/salesExecutive/Collection");
const SalesOrder = require("../../models/salesExecutive/SalesOrder");

const generateCollectionId = () =>
    `COL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const ALLOWED_PAYMENT_METHODS = [
    "Cash",
    "Cheque",
    "UPI",
    "NEFT",
    "RTGS",
];

const ALLOWED_COLLECTION_STATUSES = [
    "Pending",
    "Partially Collected",
    "Fully Collected",
    "Verified",
    "Rejected",
];

// Only verified payments reduce outstanding balance.
const getVerifiedCollections = async (salesOrderId) => {
    return Collection.find({
        salesOrder: salesOrderId,
        status: "Verified",
    });
};

const calculateCollectedAmount = (collections) =>
    collections.reduce(
        (total, collection) => total + Number(collection.paymentAmount || 0),
        0
    );

const getFileUrl = (file) =>
    file ? `/uploads/documents/${file.filename}` : "";

// GET OUTSTANDING INVOICES
const getOutstandingInvoices = async (req, res) => {
    try {
        const salesExecutiveId = req.user?.userId;

        if (!salesExecutiveId) {
            return res.status(401).json({
                success: false,
                message: "Sales Executive authentication required",
            });
        }

        const orders = await SalesOrder.find({
            salesExecutive: salesExecutiveId,
            status: { $nin: ["Draft", "Cancelled"] },
        })
            .populate("dealer", "name email")
            .sort({ createdAt: -1 });

        const invoices = await Promise.all(
            orders.map(async (order) => {
                const collections = await getVerifiedCollections(order._id);
                const collectedAmount = calculateCollectedAmount(collections);

                const outstandingAmount = Math.max(
                    0,
                    Number(order.totalAmount) - collectedAmount
                );

                const collectionStatus =
                    outstandingAmount === 0
                        ? "Fully Collected"
                        : collectedAmount > 0
                            ? "Partially Collected"
                            : "Pending";

                return {
                    orderId: order.orderId,
                    salesOrderId: order._id,
                    dealer: order.dealer,
                    invoiceAmount: order.totalAmount,
                    collectedAmount,
                    outstandingAmount,
                    collectionStatus,
                    orderStatus: order.status,
                    createdAt: order.createdAt,
                };
            })
        );

        // Only invoices with an outstanding balance are returned.
        const outstandingInvoices = invoices.filter(
            (invoice) => invoice.outstandingAmount > 0
        );

        return res.status(200).json({
            success: true,
            count: outstandingInvoices.length,
            invoices: outstandingInvoices,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch outstanding invoices",
            error: error.message,
        });
    }
};

// CREATE PAYMENT ENTRY
const createCollection = async (req, res) => {
    try {
        const salesExecutiveId = req.user?.userId;

        const {
            salesOrder,
            paymentAmount,
            paymentMethod,
            transactionReference = "",
            paymentDate,
            remarks = "",
        } = req.body;

        if (!salesExecutiveId) {
            return res.status(401).json({
                success: false,
                message: "Sales Executive authentication required",
            });
        }

        if (!mongoose.isValidObjectId(salesOrder)) {
            return res.status(400).json({
                success: false,
                message: "Valid Sales Order ID is required",
            });
        }

        const amount = Number(paymentAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Payment amount must be greater than zero",
            });
        }

        if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method",
            });
        }

        if (
            paymentDate &&
            (!Number.isFinite(Date.parse(paymentDate)) ||
                Number.isNaN(new Date(paymentDate).getTime()))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment date",
            });
        }

        const order = await SalesOrder.findOne({
            _id: salesOrder,
            salesExecutive: salesExecutiveId,
            status: { $nin: ["Draft", "Cancelled"] },
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Eligible Sales Order not found",
            });
        }

        const verifiedCollections = await getVerifiedCollections(order._id);

        const previouslyCollected =
            calculateCollectedAmount(verifiedCollections);

        const outstandingAmount = Math.max(
            0,
            Number(order.totalAmount) - previouslyCollected
        );

        if (outstandingAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "This invoice is already fully collected",
            });
        }

        if (amount > outstandingAmount) {
            return res.status(400).json({
                success: false,
                message: `Payment exceeds outstanding amount of ${outstandingAmount}`,
            });
        }

        // Validate that required files are supplied for the chosen method.
        if (paymentMethod === "Cheque" && !req.files?.chequeImage?.[0]) {
            return res.status(400).json({
                success: false,
                message: "Cheque image is required for cheque payments",
            });
        }

        if (
            paymentMethod === "UPI" &&
            !req.files?.paymentScreenshot?.[0]
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment screenshot is required for UPI payments",
            });
        }

        const payment = await Collection.create({
            collectionId: generateCollectionId(),
            salesOrder: order._id,
            dealer: order.dealer,
            salesExecutive: salesExecutiveId,
            invoiceAmount: order.totalAmount,
            paymentAmount: amount,
            paymentMethod,
            transactionReference: transactionReference.trim(),
            paymentDate: paymentDate || new Date(),
            receiptUrl: getFileUrl(req.files?.receipt?.[0]),
            chequeImageUrl: getFileUrl(req.files?.chequeImage?.[0]),
            paymentScreenshotUrl: getFileUrl(
                req.files?.paymentScreenshot?.[0]
            ),
            remarks: remarks.trim(),
            status: "Pending",
        });

        return res.status(201).json({
            success: true,
            message:
                "Payment entry created successfully and is pending verification",
            collection: payment,
        });
    
} catch (error) {
    console.error("CREATE COLLECTION ERROR:", error);

    return res.status(500).json({
        success: false,
        message: "Failed to create payment entry",
        error: error.message,
    });
}

};

// GET COLLECTION HISTORY
const getCollections = async (req, res) => {
    try {
        const salesExecutiveId = req.user?.userId;

        if (!salesExecutiveId) {
            return res.status(401).json({
                success: false,
                message: "Sales Executive authentication required",
            });
        }

        const filter = {
            salesExecutive: salesExecutiveId,
        };

        if (req.query.status) {
            if (
                !ALLOWED_COLLECTION_STATUSES.includes(req.query.status)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid collection status",
                });
            }

            filter.status = req.query.status;
        }

        const collections = await Collection.find(filter)
            .populate("salesOrder", "orderId totalAmount status")
            .populate("dealer", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: collections.length,
            collections,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch collection history",
            error: error.message,
        });
    }
};

// ADMIN: VERIFY OR REJECT COLLECTION
const updateCollectionVerification = async (req, res) => {
    try {
        const adminId = req.user?.userId;
        const { status, remarks = "" } = req.body;
        const { id } = req.params;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid collection ID is required",
            });
        }

        if (!["Verified", "Rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be Verified or Rejected",
            });
        }

        const collection = await Collection.findById(id);

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: "Collection record not found",
            });
        }

        if (collection.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: `Only Pending collections can be reviewed. Current status: ${collection.status}`,
            });
        }

        if (status === "Verified") {
            const order = await SalesOrder.findById(collection.salesOrder);

            if (!order || order.status === "Cancelled") {
                return res.status(400).json({
                    success: false,
                    message: "Collection cannot be verified because its order is missing or cancelled",
                });
            }

            const otherVerifiedPayments = await Collection.find({
                _id: { $ne: collection._id },
                salesOrder: collection.salesOrder,
                status: "Verified",
            });

            const alreadyCollected = otherVerifiedPayments.reduce(
                (total, item) => total + Number(item.paymentAmount || 0),
                0
            );

            if (alreadyCollected + collection.paymentAmount > order.totalAmount) {
                return res.status(400).json({
                    success: false,
                    message: "Verifying this payment would exceed the invoice amount",
                });
            }

            collection.invoiceAmount = order.totalAmount;
            collection.verifiedBy = adminId;
            collection.verifiedAt = new Date();
        } else {
            collection.verifiedBy = adminId;
            collection.verifiedAt = new Date();
        }

        collection.status = status;

        if (remarks.trim()) {
            collection.remarks = collection.remarks
                ? `${collection.remarks}\nAdmin: ${remarks.trim()}`
                : `Admin: ${remarks.trim()}`;
        }

        await collection.save();

        return res.status(200).json({
            success: true,
            message: `Collection ${status.toLowerCase()} successfully`,
            collection,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update collection verification",
            error: error.message,
        });
    }
};

module.exports = {
    getOutstandingInvoices,
    createCollection,
    getCollections,
    updateCollectionVerification,
};
