const LoyaltyTier = require("../../models/superadmin/loyaltyTierModel");
const LoyaltyTierType = require("../../models/superadmin/loyaltyTierTypeModel");

// =====================================================
// CREATE LOYALTY TIER
// =====================================================


exports.createLoyaltyTier = async (req, res) => {
    try {
        const {
            tierName,
            level,
            tierType,
            applicableTo,
            minPurchase,
            rewardPointsMultiplier,
            cashbackPercentage,
            benefits,
            qualificationRules,
            status,
            effectiveFrom,
            effectiveTo,
            description,
            minPoints,
            maxPoints,
            cashReward,
            giftReward,
        } = req.body;

        // Required field validation
        if (!tierName || !tierName.trim() || !level) {
            return res.status(400).json({
                success: false,
                message: "Tier name and level are required",
            });
        }

        // Point range validation
        if (
            minPoints === undefined ||
            maxPoints === undefined ||
            Number(minPoints) < 0 ||
            Number(maxPoints) < Number(minPoints)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid minimum and maximum points are required",
            });
        }

        // Check duplicate tier name and point range
        const existingTier = await LoyaltyTier.findOne({
            tierName: {
                $regex: `^${tierName.trim()}$`,
                $options: "i",
            },
            minPoints: Number(minPoints),
            maxPoints: Number(maxPoints),
        });

        if (existingTier) {
            return res.status(400).json({
                success: false,
                message: "This tier point range already exists",
            });
        }

        // Create loyalty tier
        const tier = await LoyaltyTier.create({
            tierName: tierName.trim(),
            level: Number(level),
            tierType,
            applicableTo,
            minPurchase,
            rewardPointsMultiplier,
            cashbackPercentage,
            benefits,
            qualificationRules,
            status,
            effectiveFrom,
            effectiveTo,
            description,
            minPoints: Number(minPoints),
            maxPoints: Number(maxPoints),
            cashReward: Number(cashReward) || 0,
            giftReward: giftReward || "-",
        });

        return res.status(201).json({
            success: true,
            message: "Loyalty tier created successfully",
            tier,
        });

    } catch (error) {
        return res.status(500).json({
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
        const tiers = await LoyaltyTier.find().sort({ level: 1 });

        return res.status(200).json({
            success: true,
            count: tiers.length,
            tiers,
        });
    } catch (error) {
        return res.status(500).json({
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

        return res.status(200).json({
            success: true,
            tier,
        });
    } catch (error) {
        return res.status(500).json({
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
        const {
            tierName,
            minPoints,
            maxPoints,
        } = req.body;

        // Find existing tier
        const currentTier = await LoyaltyTier.findById(req.params.id);

        if (!currentTier) {
            return res.status(404).json({
                success: false,
                message: "Loyalty tier not found",
            });
        }

        const updatedTierName = tierName ?? currentTier.tierName;
        const updatedMinPoints = minPoints ?? currentTier.minPoints;
        const updatedMaxPoints = maxPoints ?? currentTier.maxPoints;

        // Validate point range
        if (
            Number(updatedMinPoints) < 0 ||
            Number(updatedMaxPoints) < Number(updatedMinPoints)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid minimum and maximum points are required",
            });
        }

        // Check duplicate tier name and point range
        const existingTier = await LoyaltyTier.findOne({
            _id: { $ne: req.params.id },
            tierName: {
                $regex: `^${updatedTierName.trim()}$`,
                $options: "i",
            },
            minPoints: Number(updatedMinPoints),
            maxPoints: Number(updatedMaxPoints),
        });

        if (existingTier) {
            return res.status(400).json({
                success: false,
                message: "This tier point range already exists",
            });
        }

        // Update tier
        const tier = await LoyaltyTier.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                tierName: updatedTierName.trim(),
                minPoints: Number(updatedMinPoints),
                maxPoints: Number(updatedMaxPoints),
                cashReward: Number(req.body.cashReward ?? currentTier.cashReward) || 0,
                giftReward: req.body.giftReward ?? currentTier.giftReward,
            },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Loyalty tier updated successfully",
            tier,
        });

    } catch (error) {
        return res.status(500).json({
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

        return res.status(200).json({
            success: true,
            message: "Loyalty tier status updated successfully",
            tier,
        });
    } catch (error) {
        return res.status(500).json({
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

        return res.status(200).json({
            success: true,
            message: "Loyalty tier deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
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
        const active = await LoyaltyTier.countDocuments({ status: "ACTIVE" });
        const inactive = await LoyaltyTier.countDocuments({ status: "INACTIVE" });

        return res.status(200).json({
            success: true,
            stats: {
                total,
                active,
                inactive,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch loyalty tier stats",
            error: error.message,
        });
    }
};

// =====================================================
// CREATE CUSTOM TIER TYPE
// =====================================================

exports.createLoyaltyTierType = async (req, res) => {
    try {
        const { typeName } = req.body;

        if (!typeName || !typeName.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tier type name is required",
            });
        }

        const existingType = await LoyaltyTierType.findOne({
            typeName: { $regex: `^${typeName.trim()}$`, $options: "i" },
        });

        if (existingType) {
            return res.status(400).json({
                success: false,
                message: "Tier type already exists",
            });
        }

        const tierType = await LoyaltyTierType.create({
            typeName: typeName.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Tier type created successfully",
            tierType,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create tier type",
            error: error.message,
        });
    }
};

// =====================================================
// GET ALL TIER TYPES
// =====================================================

exports.getAllLoyaltyTierTypes = async (req, res) => {
    try {
        const tierTypes = await LoyaltyTierType.find().sort({ typeName: 1 });

        return res.status(200).json({
            success: true,
            count: tierTypes.length,
            tierTypes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tier types",
            error: error.message,
        });
    }
};