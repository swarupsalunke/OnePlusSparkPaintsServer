const Product = require("../../models/superadmin/Product");

// ==========================================
// GET PAINTER PRODUCTS
// ==========================================

const getPainterProducts = async (req, res) => {
    try {
        const products = await Product.find({
            status: "ACTIVE",
        }).sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        console.error(
            "Get painter products error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch painter products",
            error: error.message,
        });
    }
};

// ==========================================
// GET PAINTER PRODUCT BY ID
// ==========================================

const getPainterProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOne({
            _id: id,
            status: "ACTIVE",
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        console.error(
            "Get painter product error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch painter product",
            error: error.message,
        });
    }
};

module.exports = {
    getPainterProducts,
    getPainterProductById,
};