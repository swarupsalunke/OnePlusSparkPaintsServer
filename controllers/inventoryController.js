const InventoryStock = require("../models/InventoryStock");
const StockMovement = require("../models/StockMovement");
const Product = require("../models/Product");

const getInventoryStats = async (req, res) => {
    try {
        const stocks = await InventoryStock.find().populate(
            "product",
            "productName mrp"
        );

        let totalInventoryValue = 0;
        let totalItems = 0;
        let totalStock = 0;
        let lowStockItems = 0;
        let outOfStockItems = 0;
        let reorderLevelItems = 0;

        stocks.forEach((stock) => {
            const quantity = Number(stock.quantity || 0);
            const mrp = Number(stock.product?.mrp || 0);

            totalItems += 1;
            totalStock += quantity;
            totalInventoryValue += quantity * mrp;

            if (quantity === 0) {
                outOfStockItems += 1;
            }

            if (
                stock.reorderLevel > 0 &&
                quantity <= stock.reorderLevel
            ) {
                reorderLevelItems += 1;
            }

            if (
                quantity > 0 &&
                stock.reorderLevel > 0 &&
                quantity < stock.reorderLevel
            ) {
                lowStockItems += 1;
            }
        });

        const deadStockCutoff = new Date();
        deadStockCutoff.setDate(
            deadStockCutoff.getDate() - 365
        );

        const deadStock = await InventoryStock.countDocuments({
            quantity: { $gt: 0 },
            lastMovementDate: {
                $lt: deadStockCutoff,
            },
        });

        res.status(200).json({
            success: true,
            stats: {
                totalInventoryValue,
                totalItems,
                totalStock,
                lowStockItems,
                outOfStockItems,
                reorderLevelItems,
                deadStockItems: deadStock,
            },
        });
    } catch (error) {
        console.error(
            "Inventory stats error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch inventory statistics",
            error: error.message,
        });
    }
};

const syncInventoryProductData = async (req, res) => {
    try {
        const stocks = await InventoryStock.find();

        let updatedCount = 0;

        for (const stock of stocks) {
            const product = await Product.findById(
                stock.product
            );

            if (!product) {
                continue;
            }

            stock.category =
                product.category ||
                stock.category ||
                "";

            stock.group =
                product.group ||
                stock.group ||
                "Others";

            await stock.save();

            updatedCount++;
        }

        res.status(200).json({
            success: true,
            message:
                "Inventory stock product data synced successfully",
            updatedCount,
        });
    } catch (error) {
        console.error(
            "Inventory stock sync error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to sync inventory stock product data",
            error: error.message,
        });
    }
};

// ======================================================
// STOCK LISTING
// ======================================================

const getInventoryStocks = async (req, res) => {
    try {
        const {
            warehouse,
            category,
            group,
            product,
            lowStock,
            reorderLevel,
            outOfStock,
        } = req.query;

        const filter = {};

        if (warehouse) {
            filter.warehouse = warehouse;
        }

        if (category) {
            filter.category = category;
        }

        if (group) {
            filter.group = group;
        }

        if (product) {
            filter.product = product;
        }

        if (outOfStock === "true") {
            filter.quantity = 0;
        }

        if (reorderLevel === "true") {
            filter.reorderLevel = {
                $gt: 0,
            };
            filter.$expr = {
                $lte: [
                    "$quantity",
                    "$reorderLevel",
                ],
            };
        }

        if (lowStock === "true") {
            filter.quantity = {
                $gt: 0,
            };
            filter.$expr = {
                $lt: [
                    "$quantity",
                    "$reorderLevel",
                ],
            };
        }

        const stocks =
            await InventoryStock.find(filter)
                .populate(
                    "product",
                    "productName sku category brand mrp packingSize"
                )
                .sort({
                    updatedAt: -1,
                });

        res.status(200).json({
            success: true,
            count: stocks.length,
            stocks,
        });
    } catch (error) {
        console.error(
            "Get inventory stocks error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch inventory stocks",
            error: error.message,
        });
    }
};

// ======================================================
// CATEGORY-WISE STOCK
// ======================================================

const getCategoryStock = async (req, res) => {
    try {
        const result =
            await InventoryStock.aggregate([
                {
                    $group: {
                        _id: "$category",
                        totalStock: {
                            $sum: "$quantity",
                        },
                    },
                },

                {
                    $sort: {
                        totalStock: -1,
                    },
                },
            ]);

        res.status(200).json({
            success: true,
            categoryStock: result,
        });
    } catch (error) {
        console.error(
            "Category stock error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch category-wise stock",
            error: error.message,
        });
    }
};

// ======================================================
// GROUP-WISE STOCK
// ======================================================

const getGroupStock = async (req, res) => {
    try {
        const result =
            await InventoryStock.aggregate([
                {
                    $group: {
                        _id: "$group",
                        totalStock: {
                            $sum: "$quantity",
                        },
                    },
                },
                {
                    $sort: {
                        totalStock: -1,
                    },
                },
            ]);

        res.status(200).json({
            success: true,
            groupStock: result,
        });
    } catch (error) {
        console.error(
            "Group stock error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch group-wise stock",
            error: error.message,
        });
    }
};

// ======================================================
// WAREHOUSE STOCK
// ======================================================

const getWarehouseStock = async (req, res) => {
    try {
        const result =
            await InventoryStock.aggregate([
                {
                    $group: {
                        _id: "$warehouse",

                        rawMaterial: {
                            $sum: {
                                $cond: [
                                    {
                                        $regexMatch: {
                                            input: {
                                                $toLower: {
                                                    $ifNull: ["$category", ""],
                                                },
                                            },
                                            regex: "^raw material$",
                                        },
                                    },
                                    "$quantity",
                                    0,
                                ],
                            },
                        },

                        packingMaterial: {
                            $sum: {
                                $cond: [
                                    {
                                        $regexMatch: {
                                            input: {
                                                $toLower: {
                                                    $ifNull: ["$category", ""],
                                                },
                                            },
                                            regex: "^packing material$",
                                        },
                                    },
                                    "$quantity",
                                    0,
                                ],
                            },
                        },

                        finishedGoods: {
                            $sum: {
                                $cond: [
                                    {
                                        $regexMatch: {
                                            input: {
                                                $toLower: {
                                                    $ifNull: ["$category", ""],
                                                },
                                            },
                                            regex:
                                                "^finished goods$|^finished good$|^emulsion$|^primer$|^putty$|^enamel$|^texture$|^wood finish$|^waterproofing$",
                                        },
                                    },
                                    "$quantity",
                                    0,
                                ],
                            },
                        },

                        wip: {
                            $sum: {
                                $cond: [
                                    {
                                        $regexMatch: {
                                            input: {
                                                $toLower: {
                                                    $ifNull: ["$category", ""],
                                                },
                                            },
                                            regex: "^work in progress$|^wip$",
                                        },
                                    },
                                    "$quantity",
                                    0,
                                ],
                            },
                        },

                        totalStock: {
                            $sum: "$quantity",
                        },
                    },
                },

                {
                    $sort: {
                        totalStock: -1,
                    },
                },
            ]);

        res.status(200).json({
            success: true,
            warehouseStock: result,
        });
    } catch (error) {
        console.error(
            "Warehouse stock error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch warehouse stock",
            error: error.message,
        });
    }
};

// ======================================================
// STOCK MOVEMENTS
// ======================================================

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
                const start = new Date(dateFrom);
                start.setHours(0, 0, 0, 0);

                filter.movementDate.$gte = start;
            }

            if (dateTo) {
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);

                filter.movementDate.$lte = end;
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
            "Stock movements error:",
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
// STOCK SUMMARY
// ======================================================

const getStockSummary = async (req, res) => {
    try {
        const [
            totalStock,
            totalInward,
            totalOutward,
            totalTransfers,
            totalAdjustments,
        ] = await Promise.all([
            InventoryStock.aggregate([
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$quantity",
                        },
                    },
                },
            ]),

            StockMovement.aggregate([
                {
                    $match: {
                        movementType: "INWARD",
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$quantity",
                        },
                    },
                },
            ]),

            StockMovement.aggregate([
                {
                    $match: {
                        movementType: "OUTWARD",
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$quantity",
                        },
                    },
                },
            ]),

            StockMovement.aggregate([
                {
                    $match: {
                        movementType: "TRANSFER",
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$quantity",
                        },
                    },
                },
            ]),

            StockMovement.aggregate([
                {
                    $match: {
                        movementType: "ADJUSTMENT",
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$quantity",
                        },
                    },
                },
            ]),
        ]);

        res.status(200).json({
            success: true,
            summary: {
                totalStock:
                    totalStock[0]?.total || 0,
                totalInward:
                    totalInward[0]?.total || 0,
                totalOutward:
                    totalOutward[0]?.total || 0,
                totalTransfers:
                    totalTransfers[0]?.total || 0,
                totalAdjustments:
                    totalAdjustments[0]?.total || 0,
            },
        });
    } catch (error) {
        console.error(
            "Stock summary error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch stock summary",
            error: error.message,
        });
    }
};

const getTopConsumedItems = async (req, res) => {
    try {
        const now = new Date();

        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        );

        const result =
            await StockMovement.aggregate([
                {
                    $match: {
                        movementType: "OUTWARD",
                        movementDate: {
                            $gte: startOfMonth,
                            $lt: endOfMonth,
                        },
                    },
                },

                {
                    $group: {
                        _id: "$product",
                        consumedQuantity: {
                            $sum: "$quantity",
                        },
                    },
                },

                {
                    $sort: {
                        consumedQuantity: -1,
                    },
                },

                {
                    $limit: 5,
                },

                {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "product",
                    },
                },

                {
                    $unwind: {
                        path: "$product",
                        preserveNullAndEmptyArrays: true,
                    },
                },

                {
                    $project: {
                        _id: 1,
                        productName:
                            "$product.productName",
                        sku: "$product.sku",
                        consumedQuantity: 1,
                    },
                },
            ]);

        res.status(200).json({
            success: true,
            count: result.length,
            topConsumedItems: result,
        });
    } catch (error) {
        console.error(
            "Top consumed items error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch top consumed items",
            error: error.message,
        });
    }
};

// ======================================================
// STOCK QUERY
// ======================================================

const getStockQuery = async (req, res) => {
    try {
        const {
            warehouse,
            category,
            group,
            product,
        } = req.query;

        const filter = {};

        if (warehouse) {
            filter.warehouse = warehouse;
        }

        if (category) {
            filter.category = category;
        }

        if (group) {
            filter.group = group;
        }

        if (product) {
            filter.product = product;
        }

        const stocks =
            await InventoryStock.find(filter)
                .populate(
                    "product",
                    "productName sku category brand mrp"
                )
                .sort({
                    quantity: -1,
                });

        res.status(200).json({
            success: true,
            count: stocks.length,
            result: stocks,
        });
    } catch (error) {
        console.error(
            "Stock query error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to execute stock query",
            error: error.message,
        });
    }
};

// ======================================================
// LOW STOCK ALERTS
// ======================================================

const getLowStock = async (req, res) => {
    try {
        const stocks =
            await InventoryStock.find({
                quantity: {
                    $gt: 0,
                },
                reorderLevel: {
                    $gt: 0,
                },
                $expr: {
                    $lt: [
                        "$quantity",
                        "$reorderLevel",
                    ],
                },
            })
                .populate(
                    "product",
                    "productName sku category brand"
                )
                .sort({
                    quantity: 1,
                });

        res.status(200).json({
            success: true,
            count: stocks.length,
            lowStock: stocks,
        });
    } catch (error) {
        console.error(
            "Low stock error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch low stock alerts",
            error: error.message,
        });
    }
};

// ======================================================
// REORDER LEVEL
// ======================================================

const getReorderLevel = async (req, res) => {
    try {
        const stocks =
            await InventoryStock.find({
                reorderLevel: {
                    $gt: 0,
                },
                $expr: {
                    $lte: [
                        "$quantity",
                        "$reorderLevel",
                    ],
                },
            })
                .populate(
                    "product",
                    "productName sku category brand"
                )
                .sort({
                    quantity: 1,
                });

        res.status(200).json({
            success: true,
            count: stocks.length,
            reorderLevelItems: stocks,
        });
    } catch (error) {
        console.error(
            "Reorder level error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch reorder level items",
            error: error.message,
        });
    }
};

// ======================================================
// DEAD STOCK / STOCK AGEING
// ======================================================

const getDeadStock = async (req, res) => {
    try {
        const days = Number(
            req.query.days || 365
        );

        const cutoff = new Date();
        cutoff.setDate(
            cutoff.getDate() - days
        );

        const stocks =
            await InventoryStock.find({
                quantity: {
                    $gt: 0,
                },
                lastMovementDate: {
                    $lt: cutoff,
                },
            })
                .populate(
                    "product",
                    "productName sku category brand mrp"
                )
                .sort({
                    lastMovementDate: 1,
                });

        res.status(200).json({
            success: true,
            count: stocks.length,
            days,
            deadStock: stocks,
        });
    } catch (error) {
        console.error(
            "Dead stock error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch dead stock",
            error: error.message,
        });
    }
};

// ======================================================
// STOCK AGEING
// ======================================================

const getStockAgeing = async (req, res) => {
    try {
        const stocks =
            await InventoryStock.find({
                quantity: {
                    $gt: 0,
                },
            })
                .populate(
                    "product",
                    "productName sku category brand"
                )
                .sort({
                    lastReceivedDate: 1,
                });

        const now = new Date();

        const ageing = stocks.map(
            (stock) => {
                const baseDate =
                    stock.lastReceivedDate ||
                    stock.lastMovementDate;

                const ageInDays = baseDate
                    ? Math.floor(
                        (
                            now.getTime() -
                            new Date(
                                baseDate
                            ).getTime()
                        ) /
                        (1000 *
                            60 *
                            60 *
                            24)
                    )
                    : null;

                return {
                    ...stock.toObject(),
                    ageInDays,
                };
            }
        );

        res.status(200).json({
            success: true,
            count: ageing.length,
            ageing,
        });
    } catch (error) {
        console.error(
            "Stock ageing error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch stock ageing",
            error: error.message,
        });
    }
};

// ======================================================
// INVENTORY OVERVIEW
// ======================================================

const getInventoryOverview = async (
    req,
    res
) => {
    try {
        const [
            categoryStock,
            groupStock,
            warehouseStock,
            lowStock,
            summary,
        ] = await Promise.all([
            getAggregatedCategoryStock(),
            getAggregatedGroupStock(),
            getAggregatedWarehouseStock(),
            InventoryStock.find({
                quantity: {
                    $gt: 0,
                },
                reorderLevel: {
                    $gt: 0,
                },
                $expr: {
                    $lt: [
                        "$quantity",
                        "$reorderLevel",
                    ],
                },
            })
                .populate(
                    "product",
                    "productName sku"
                )
                .limit(10)
                .sort({
                    quantity: 1,
                }),
            getSummaryData(),
        ]);

        res.status(200).json({
            success: true,
            overview: {
                categoryStock,
                groupStock,
                warehouseStock,
                lowStockAlerts: lowStock,
                stockSummary: summary,
            },
        });
    } catch (error) {
        console.error(
            "Inventory overview error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch inventory overview",
            error: error.message,
        });
    }
};

// ======================================================
// INTERNAL HELPERS
// ======================================================

const getAggregatedCategoryStock =
    async () => {
        return InventoryStock.aggregate([
            {
                $group: {
                    _id: "$category",
                    totalStock: {
                        $sum: "$quantity",
                    },
                },
            },
            {
                $sort: {
                    totalStock: -1,
                },
            },
        ]);
    };

const getAggregatedGroupStock =
    async () => {
        return InventoryStock.aggregate([
            {
                $group: {
                    _id: "$group",
                    totalStock: {
                        $sum: "$quantity",
                    },
                },
            },
            {
                $sort: {
                    totalStock: -1,
                },
            },
        ]);
    };

const getAggregatedWarehouseStock = async () => {
    return InventoryStock.aggregate([
        {
            $addFields: {
                categoryBucket: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $in: [
                                        {
                                            $toLower: {
                                                $trim: {
                                                    input: {
                                                        $ifNull: [
                                                            "$category",
                                                            "",
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                        [
                                            "raw material",
                                            "raw materials",
                                        ],
                                    ],
                                },
                                then: "Raw Material",
                            },

                            {
                                case: {
                                    $in: [
                                        {
                                            $toLower: {
                                                $trim: {
                                                    input: {
                                                        $ifNull: [
                                                            "$category",
                                                            "",
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                        [
                                            "packing material",
                                            "packing materials",
                                        ],
                                    ],
                                },
                                then: "Packing Material",
                            },

                            {
                                case: {
                                    $in: [
                                        {
                                            $toLower: {
                                                $trim: {
                                                    input: {
                                                        $ifNull: [
                                                            "$category",
                                                            "",
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                        [
                                            "work in progress",
                                            "wip",
                                        ],
                                    ],
                                },
                                then: "WIP",
                            },

                            {
                                case: {
                                    $in: [
                                        {
                                            $toLower: {
                                                $trim: {
                                                    input: {
                                                        $ifNull: [
                                                            "$category",
                                                            "",
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                        [
                                            "finished goods",
                                            "finished good",
                                            "emulsion",
                                            "primer",
                                            "putty",
                                            "enamel",
                                            "texture",
                                            "wood finish",
                                            "waterproofing",
                                        ],
                                    ],
                                },
                                then: "Finished Goods",
                            },
                        ],

                        default: "Finished Goods",
                    },
                },
            },
        },

        {
            $group: {
                _id: "$warehouse",

                rawMaterial: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    "$categoryBucket",
                                    "Raw Material",
                                ],
                            },
                            "$quantity",
                            0,
                        ],
                    },
                },

                packingMaterial: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    "$categoryBucket",
                                    "Packing Material",
                                ],
                            },
                            "$quantity",
                            0,
                        ],
                    },
                },

                finishedGoods: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    "$categoryBucket",
                                    "Finished Goods",
                                ],
                            },
                            "$quantity",
                            0,
                        ],
                    },
                },

                wip: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    "$categoryBucket",
                                    "WIP",
                                ],
                            },
                            "$quantity",
                            0,
                        ],
                    },
                },

                totalStock: {
                    $sum: "$quantity",
                },
            },
        },

        {
            $sort: {
                totalStock: -1,
            },
        },
    ]);
};

const getSummaryData = async () => {
    const result =
        await InventoryStock.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: {
                        $sum: "$quantity",
                    },
                },
            },
        ]);

    return {
        totalStock:
            result[0]?.totalStock || 0,
    };
};

// ======================================================
// UPDATE STOCK MOVEMENT
// ======================================================

const updateStockMovement = async (req, res) => {
    try {
        const { id } = req.params;

        const movement = await StockMovement.findById(id);

        if (!movement) {
            return res.status(404).json({
                success: false,
                message: "Stock movement not found",
            });
        }

        const allowedFields = [
            "product",
            "warehouse",
            "quantity",
            "unit",
            "reference",
            "movementDate",
            "remarks",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                movement[field] = req.body[field];
            }
        });

        await movement.save();

        const updatedMovement =
            await StockMovement.findById(movement._id)
                .populate(
                    "product",
                    "productName sku category group brand"
                )
                .populate(
                    "user",
                    "name email"
                );

        res.status(200).json({
            success: true,
            message: "Stock movement updated successfully",
            movement: updatedMovement,
        });
    } catch (error) {
        console.error(
            "Update stock movement error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update stock movement",
            error: error.message,
        });
    }
};


// ======================================================
// DELETE STOCK MOVEMENT
// ======================================================

const deleteStockMovement = async (req, res) => {
    try {
        const { id } = req.params;

        const movement =
            await StockMovement.findById(id);

        if (!movement) {
            return res.status(404).json({
                success: false,
                message: "Stock movement not found",
            });
        }

        await StockMovement.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Stock movement deleted successfully",
        });
    } catch (error) {
        console.error(
            "Delete stock movement error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete stock movement",
            error: error.message,
        });
    }
};

module.exports = {
    getInventoryStats,
    syncInventoryProductData,
    getInventoryStocks,
    getCategoryStock,
    getGroupStock,
    getWarehouseStock,
    getStockMovements,
    getStockSummary,
    getStockQuery,
    getLowStock,
    getReorderLevel,
    getDeadStock,
    getStockAgeing,
    getInventoryOverview,
    getTopConsumedItems,
    updateStockMovement,
    deleteStockMovement,
};