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
    } = req.body;

    if (!tierName || !level) {
      return res.status(400).json({
        success: false,
        message: "Tier name and level are required",
      });
    }

    const existingTier = await LoyaltyTier.findOne({
      tierName: { $regex: `^${tierName.trim()}$`, $options: "i" },
    });

    if (existingTier) {
      return res.status(400).json({
        success: false,
        message: "Loyalty tier already exists",
      });
    }

    const tier = await LoyaltyTier.create({
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
    const { tierName } = req.body;

    if (tierName) {
      const existingTier = await LoyaltyTier.findOne({
        tierName: { $regex: `^${tierName.trim()}$`, $options: "i" },
        _id: { $ne: req.params.id },
      });

      if (existingTier) {
        return res.status(400).json({
          success: false,
          message: "Loyalty tier name already exists",
        });
      }
    }

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