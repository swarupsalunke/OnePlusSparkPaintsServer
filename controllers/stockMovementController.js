const StockMovement = require("../models/StockMovement");
const InventoryStock = require("../models/InventoryStock");
const Product = require("../models/Product");

const getStockMovements = async (req, res) => {
    try {
        const {
            product,
            warehouse,
            movementType,
            dateFrom,
            dateTo,
        } = req.query;

        const filter = {};

        if (product) {
            filter.product = product;
        }

        if (warehouse) {
            filter.warehouse = warehouse;
        }

        if (movementType) {
            filter.movementType = movementType;
        }

        if (dateFrom || dateTo) {
            filter.movementDate = {};

            if (dateFrom) {
                const startDate = new Date(dateFrom);
                startDate.setHours(0, 0, 0, 0);

                filter.movementDate.$gte = startDate;
            }

            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);

                filter.movementDate.$lte = endDate;
            }
        }

        const movements =
            await StockMovement.find(filter)
                .populate(
                    "product",
                    "productName sku category group brand"
                )
                .populate(
                    "user",
                    "name email"
                )
                .sort({
                    movementDate: -1,
                });

        res.status(200).json({
            success: true,
            count: movements.length,
            movements,
        });
    } catch (error) {
        console.error(
            "Get stock movements error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch stock movements",
            error: error.message,
        });
    }
};

// ======================================================
// INWARD MATERIAL
// ======================================================

const createInward = async (req, res) => {
    try {
        const {
            product,
            warehouse,
            quantity,
            unit,
            reference,
            movementDate,
            remarks,
        } = req.body;

        if (
            !product ||
            !warehouse ||
            quantity === undefined ||
            !unit
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide product, warehouse, quantity and unit",
            });
        }

        const numericQuantity = Number(quantity);

        if (numericQuantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0",
            });
        }

        const productData = await Product.findById(product);

        if (!productData) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        let stock =
            await InventoryStock.findOne({
                product,
                warehouse,
            });

        if (!stock) {
            stock = await InventoryStock.create({
                product,
                warehouse,

                category: productData.category || "",
                group: productData.group || "",

                quantity: 0,
                unit,

                lastMovementDate: null,
                lastReceivedDate: null,
            });
        } else {
            // Keep stock master data synced with product
            stock.category =
                productData.category || stock.category || "";

            stock.group =
                productData.group || stock.group || "";
        }

        stock.quantity += numericQuantity;
        stock.unit = unit;
        stock.lastMovementDate =
            movementDate || new Date();
        stock.lastReceivedDate =
            movementDate || new Date();

        await stock.save();

        const movement =
            await StockMovement.create({
                product,
                warehouse,
                movementType: "INWARD",
                quantity: numericQuantity,
                unit,
                reference: reference || "",
                movementDate:
                    movementDate || new Date(),
                user: req.user?.userId || null,
                remarks: remarks || "",
            });

        const populatedMovement =
            await StockMovement.findById(
                movement._id
            )
                .populate(
                    "product",
                    "productName sku category brand"
                )
                .populate(
                    "user",
                    "name email"
                );

        res.status(201).json({
            success: true,
            message:
                "Inward material recorded successfully",
            movement: populatedMovement,
            stock,
        });
    } catch (error) {
        console.error(
            "Create inward error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to record inward material",
            error: error.message,
        });
    }
};

// ======================================================
// OUTWARD MATERIAL
// ======================================================

const createOutward = async (req, res) => {
    try {
        const {
            product,
            warehouse,
            quantity,
            unit,
            reference,
            movementDate,
            remarks,
        } = req.body;

        if (
            !product ||
            !warehouse ||
            quantity === undefined ||
            !unit
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide product, warehouse, quantity and unit",
            });
        }

        const numericQuantity = Number(quantity);

        if (
            !Number.isFinite(numericQuantity) ||
            numericQuantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0",
            });
        }

        const productData =
            await Product.findById(product);

        if (!productData) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const stock =
            await InventoryStock.findOne({
                product,
                warehouse,
            });

        // IMPORTANT:
        // Stock must exist before updating category/group.
        if (!stock) {
            return res.status(404).json({
                success: false,
                message:
                    "Inventory stock not found for selected product and warehouse",
            });
        }

        if (
            stock.quantity < numericQuantity
        ) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock available",
            });
        }

        // Keep stock master data synced with Product
        stock.category =
            productData.category ||
            stock.category ||
            "";

        stock.group =
            productData.group ||
            stock.group ||
            "Others";

        stock.quantity -= numericQuantity;
        stock.unit = unit;

        stock.lastMovementDate =
            movementDate || new Date();

        await stock.save();

        const movement =
            await StockMovement.create({
                product,
                warehouse,
                movementType: "OUTWARD",
                quantity: numericQuantity,
                unit,
                reference: reference || "",
                movementDate:
                    movementDate || new Date(),
                user: req.user?.userId || null,
                remarks: remarks || "",
            });

        const populatedMovement =
            await StockMovement.findById(
                movement._id
            )
                .populate(
                    "product",
                    "productName sku category group brand"
                )
                .populate(
                    "user",
                    "name email"
                );

        return res.status(201).json({
            success: true,
            message:
                "Outward material recorded successfully",
            movement: populatedMovement,
            stock,
        });
    } catch (error) {
        console.error(
            "Create outward error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to record outward material",
            error: error.message,
        });
    }
};

// ======================================================
// STOCK TRANSFER
// ======================================================

const createTransfer = async (req, res) => {
    try {
        const {
            product,
            fromWarehouse,
            toWarehouse,
            quantity,
            unit,
            reference,
            movementDate,
            remarks,
        } = req.body;

        if (
            !product ||
            !fromWarehouse ||
            !toWarehouse ||
            quantity === undefined ||
            !unit
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide product, source warehouse, destination warehouse, quantity and unit",
            });
        }

        if (fromWarehouse === toWarehouse) {
            return res.status(400).json({
                success: false,
                message:
                    "Source and destination warehouse cannot be the same",
            });
        }

        const numericQuantity = Number(quantity);

        if (numericQuantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0",
            });
        }

        const sourceStock =
            await InventoryStock.findOne({
                product,
                warehouse: fromWarehouse,
            });

        if (!sourceStock) {
            return res.status(404).json({
                success: false,
                message:
                    "Source warehouse stock not found",
            });
        }

        if (
            sourceStock.quantity <
            numericQuantity
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Insufficient stock in source warehouse",
            });
        }

        let destinationStock =
            await InventoryStock.findOne({
                product,
                warehouse: toWarehouse,
            });

        if (!destinationStock) {
            destinationStock =
                await InventoryStock.create({
                    product,
                    warehouse: toWarehouse,
                    category:
                        sourceStock.category || "",
                    group: sourceStock.group || "",
                    quantity: 0,
                    unit,
                    reorderLevel:
                        sourceStock.reorderLevel || 0,
                    lastMovementDate: null,
                    lastReceivedDate: null,
                });
        }

        const movementDateValue =
            movementDate || new Date();

        sourceStock.quantity -=
            numericQuantity;
        sourceStock.unit = unit;
        sourceStock.lastMovementDate =
            movementDateValue;

        destinationStock.quantity +=
            numericQuantity;
        destinationStock.unit = unit;
        destinationStock.lastMovementDate =
            movementDateValue;

        await sourceStock.save();
        await destinationStock.save();

        const movement =
            await StockMovement.create({
                product,
                warehouse: fromWarehouse,
                movementType: "TRANSFER",
                quantity: numericQuantity,
                unit,
                fromWarehouse,
                toWarehouse,
                reference: reference || "",
                movementDate: movementDateValue,
                user: req.user?.userId || null,
                remarks: remarks || "",
            });

        const populatedMovement =
            await StockMovement.findById(
                movement._id
            )
                .populate(
                    "product",
                    "productName sku category brand"
                )
                .populate(
                    "user",
                    "name email"
                );

        res.status(201).json({
            success: true,
            message:
                "Stock transferred successfully",
            movement: populatedMovement,
            sourceStock,
            destinationStock,
        });
    } catch (error) {
        console.error(
            "Create transfer error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to transfer stock",
            error: error.message,
        });
    }
};

// ======================================================
// STOCK ADJUSTMENT
// ======================================================

const createAdjustment = async (
    req,
    res
) => {
    try {
        const {
            product,
            warehouse,
            quantity,
            unit,
            reference,
            movementDate,
            remarks,
        } = req.body;

        if (
            !product ||
            !warehouse ||
            quantity === undefined ||
            !unit
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide product, warehouse, quantity and unit",
            });
        }

        const numericQuantity = Number(quantity);

        if (numericQuantity === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Adjustment quantity cannot be zero",
            });
        }

        const stock =
            await InventoryStock.findOne({
                product,
                warehouse,
            }); const productData = await Product.findById(product);

        if (!productData) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        stock.category =
            productData.category || stock.category || "";

        stock.group =
            productData.group || stock.group || "";



        if (!stock) {
            return res.status(404).json({
                success: false,
                message:
                    "Inventory stock not found",
            });
        }

        const newQuantity =
            stock.quantity + numericQuantity;

        if (newQuantity < 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Adjustment cannot make stock negative",
            });
        }

        stock.quantity = newQuantity;
        stock.unit = unit;
        stock.lastMovementDate =
            movementDate || new Date();

        await stock.save();

        const movement =
            await StockMovement.create({
                product,
                warehouse,
                movementType: "ADJUSTMENT",
                quantity: Math.abs(
                    numericQuantity
                ),
                unit,
                reference: reference || "",
                movementDate:
                    movementDate || new Date(),
                user: req.user?.userId || null,
                remarks:
                    remarks ||
                    `Stock adjustment: ${numericQuantity > 0
                        ? "+"
                        : "-"
                    }${Math.abs(
                        numericQuantity
                    )}`,
            });

        const populatedMovement =
            await StockMovement.findById(
                movement._id
            )
                .populate(
                    "product",
                    "productName sku category brand"
                )
                .populate(
                    "user",
                    "name email"
                );

        res.status(201).json({
            success: true,
            message:
                "Stock adjustment recorded successfully",
            movement: populatedMovement,
            stock,
        });
    } catch (error) {
        console.error(
            "Create adjustment error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to record stock adjustment",
            error: error.message,
        });
    }
};

module.exports = {
    getStockMovements,
    createInward,
    createOutward,
    createTransfer,
    createAdjustment,
};