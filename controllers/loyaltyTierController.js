const LoyaltyTier = require("../models/loyaltyTierModel");

// =====================================================
// CREATE LOYALTY TIER
// =====================================================

exports.createLoyaltyTier = async (req, res) => {
    try {
        const {
            tierName,
            level,
            minPoints,
            maxPoints,
            rewardPointsMultiplier,
            exclusiveSchemes,
            cashbackOffers,
            earlyProductLaunch,
            premiumSupport,
            status,
        } = req.body;

        const existingTier = await LoyaltyTier.findOne({ tierName });

        if (existingTier) {
            return res.status(400).json({
                success: false,
                message: "Loyalty tier already exists",
            });
        }

        const tier = await LoyaltyTier.create({
            tierName,
            level,
            minPoints,
            maxPoints,
            rewardPointsMultiplier,
            exclusiveSchemes,
            cashbackOffers,
            earlyProductLaunch,
            premiumSupport,
            status,
        });

        res.status(201).json({
            success: true,
            message: "Loyalty tier created successfully",
            tier,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create loyalty tier",
            error: error.message,
        });
    }
};


// =====================================================
// GET ALL LOYALTY TIERS
// =====================================================

exports.getAllLoyaltyTiers = async (req, res) => {
    try {
        const tiers = await LoyaltyTier.find().sort({ minPoints: 1 });

        res.status(200).json({
            success: true,
            count: tiers.length,
            tiers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch loyalty tiers",
            error: error.message,
        });
    }
};


// =====================================================
// GET SINGLE LOYALTY TIER
// =====================================================

exports.getLoyaltyTierById = async (req, res) => {
    try {
        const tier = await LoyaltyTier.findById(req.params.id);

        if (!tier) {
            return res.status(404).json({
                success: false,
                message: "Loyalty tier not found",
            });
        }

        res.status(200).json({
            success: true,
            tier,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch loyalty tier",
            error: error.message,
        });
    }
};


// =====================================================
// UPDATE LOYALTY TIER
// =====================================================

exports.updateLoyaltyTier = async (req, res) => {
    try {
        const tier = await LoyaltyTier.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!tier) {
            return res.status(404).json({
                success: false,
                message: "Loyalty tier not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Loyalty tier updated successfully",
            tier,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update loyalty tier",
            error: error.message,
        });
    }
};


// =====================================================
// UPDATE TIER STATUS
// =====================================================

exports.updateLoyaltyTierStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const tier = await LoyaltyTier.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!tier) {
            return res.status(404).json({
                success: false,
                message: "Loyalty tier not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Loyalty tier status updated successfully",
            tier,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update loyalty tier status",
            error: error.message,
        });
    }
};


// =====================================================
// DELETE LOYALTY TIER
// =====================================================

exports.deleteLoyaltyTier = async (req, res) => {
    try {
        const tier = await LoyaltyTier.findByIdAndDelete(req.params.id);

        if (!tier) {
            return res.status(404).json({
                success: false,
                message: "Loyalty tier not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Loyalty tier deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete loyalty tier",
            error: error.message,
        });
    }
};


// =====================================================
// GET LOYALTY TIER STATS
// =====================================================

exports.getLoyaltyTierStats = async (req, res) => {
    try {
        const total = await LoyaltyTier.countDocuments();

        const active = await LoyaltyTier.countDocuments({
            status: "ACTIVE",
        });

        const inactive = await LoyaltyTier.countDocuments({
            status: "INACTIVE",
        });

        res.status(200).json({
            success: true,
            stats: {
                total,
                active,
                inactive,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch loyalty tier stats",
            error: error.message,
        });
    }
};