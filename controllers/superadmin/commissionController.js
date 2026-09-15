const Commission = require("../../models/superadmin/commissionModel");

// =====================================================
// CREATE COMMISSION
// =====================================================

exports.createCommission = async (req, res) => {
  try {
    const {
      user,
      userType,
      branch,
      territory,
      schemeSource,
      salesAmount,
      rewardPoints,
      cashReward,
      commissionPercentage,
      penalty,
      netPayable,
      status,
      paymentDate,
    } = req.body;

    // -------------------------------------------------
    // REQUIRED FIELDS
    // -------------------------------------------------

    if (!user || !userType || !branch || !territory || !schemeSource) {
      return res.status(400).json({
        success: false,
        message:
          "User, User Type, Branch, Territory and Scheme / Source are required",
      });
    }

    if (
      salesAmount === undefined ||
      salesAmount === null ||
      salesAmount === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Sales Amount is required",
      });
    }

    // -------------------------------------------------
    // NUMBER VALUES
    // -------------------------------------------------

    const salesAmountValue = Number(salesAmount);
    const rewardPointsValue = Number(rewardPoints || 0);
    const commissionPercentageValue = Number(
      commissionPercentage || 0
    );
    const penaltyValue = Number(penalty || 0);

    if (Number.isNaN(salesAmountValue) || salesAmountValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Sales Amount must be a valid positive number",
      });
    }

    if (
      Number.isNaN(rewardPointsValue) ||
      rewardPointsValue < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Reward Points must be a valid number",
      });
    }

    if (
      Number.isNaN(commissionPercentageValue) ||
      commissionPercentageValue < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Commission % must be a valid number",
      });
    }

    if (Number.isNaN(penaltyValue) || penaltyValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Penalty must be a valid number",
      });
    }

    // -------------------------------------------------
    // COMMISSION CALCULATION
    // -------------------------------------------------

    const calculatedCashReward =
      salesAmountValue *
      (commissionPercentageValue / 100);

    const finalCashReward =
      cashReward !== undefined &&
      cashReward !== null &&
      cashReward !== ""
        ? Number(cashReward)
        : calculatedCashReward;

    if (
      Number.isNaN(finalCashReward) ||
      finalCashReward < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Cash Reward must be a valid number",
      });
    }

    // -------------------------------------------------
    // NET PAYABLE
    // -------------------------------------------------

    const calculatedNetPayable =
      finalCashReward - penaltyValue;

    const finalNetPayable =
      netPayable !== undefined &&
      netPayable !== null &&
      netPayable !== ""
        ? Number(netPayable)
        : Math.max(calculatedNetPayable, 0);

    if (
      Number.isNaN(finalNetPayable) ||
      finalNetPayable < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Net Payable must be a valid number",
      });
    }

    // -------------------------------------------------
    // CREATE
    // -------------------------------------------------

    const commission = await Commission.create({
      user: user.trim(),
      userType: userType.trim(),
      branch: branch.trim(),
      territory: territory.trim(),
      schemeSource: schemeSource.trim(),

      salesAmount: salesAmountValue,

      rewardPoints: rewardPointsValue,

      cashReward: finalCashReward,

      commissionPercentage: commissionPercentageValue,

      penalty: penaltyValue,

      netPayable: finalNetPayable,

      status: status || "PENDING_CALCULATION",

      paymentDate: paymentDate || null,
    });

    return res.status(201).json({
      success: true,
      message: "Commission created successfully",
      commission,
    });
  } catch (error) {
    console.error("Create commission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create commission",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL COMMISSIONS
// =====================================================

exports.getCommissions = async (req, res) => {
  try {
    const commissions = await Commission.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: commissions.length,
      commissions,
    });
  } catch (error) {
    console.error("Get commissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch commissions",
      error: error.message,
    });
  }
};

// =====================================================
// GET COMMISSION BY ID
// =====================================================

exports.getCommissionById = async (req, res) => {
  try {
    const commission = await Commission.findById(
      req.params.id
    );

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    return res.status(200).json({
      success: true,
      commission,
    });
  } catch (error) {
    console.error(
      "Get commission by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch commission",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE COMMISSION
// =====================================================

exports.updateCommission = async (req, res) => {
  try {
    const commission =
      await Commission.findById(req.params.id);

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    const {
      user,
      userType,
      branch,
      territory,
      schemeSource,
      salesAmount,
      rewardPoints,
      cashReward,
      commissionPercentage,
      penalty,
      netPayable,
      status,
      paymentDate,
    } = req.body;

    // -------------------------------------------------
    // UPDATE BASIC FIELDS
    // -------------------------------------------------

    if (user !== undefined) {
      commission.user = user.trim();
    }

    if (userType !== undefined) {
      commission.userType = userType.trim();
    }

    if (branch !== undefined) {
      commission.branch = branch.trim();
    }

    if (territory !== undefined) {
      commission.territory = territory.trim();
    }

    if (schemeSource !== undefined) {
      commission.schemeSource = schemeSource.trim();
    }

    if (salesAmount !== undefined) {
      const value = Number(salesAmount);

      if (Number.isNaN(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Sales Amount must be a valid number",
        });
      }

      commission.salesAmount = value;
    }

    if (rewardPoints !== undefined) {
      const value = Number(rewardPoints);

      if (Number.isNaN(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Reward Points must be a valid number",
        });
      }

      commission.rewardPoints = value;
    }

    if (commissionPercentage !== undefined) {
      const value = Number(commissionPercentage);

      if (Number.isNaN(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Commission % must be a valid number",
        });
      }

      commission.commissionPercentage = value;
    }

    if (penalty !== undefined) {
      const value = Number(penalty);

      if (Number.isNaN(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Penalty must be a valid number",
        });
      }

      commission.penalty = value;
    }

    if (cashReward !== undefined) {
      const value = Number(cashReward);

      if (Number.isNaN(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Cash Reward must be a valid number",
        });
      }

      commission.cashReward = value;
    }

    if (netPayable !== undefined) {
      const value = Number(netPayable);

      if (Number.isNaN(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Net Payable must be a valid number",
        });
      }

      commission.netPayable = value;
    }

    if (status !== undefined) {
      commission.status = status;
    }

    if (paymentDate !== undefined) {
      commission.paymentDate =
        paymentDate || null;
    }

    // -------------------------------------------------
    // SAVE
    // -------------------------------------------------

    await commission.save();

    return res.status(200).json({
      success: true,
      message: "Commission updated successfully",
      commission,
    });
  } catch (error) {
    console.error(
      "Update commission error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update commission",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE COMMISSION STATUS
// =====================================================

exports.updateCommissionStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING_CALCULATION",
      "UNDER_VERIFICATION",
      "APPROVED",
      "RELEASED",
      "ON_HOLD",
      "CANCELLED",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid commission status",
      });
    }

    const commission =
      await Commission.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Commission status updated successfully",
      commission,
    });
  } catch (error) {
    console.error(
      "Update commission status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update commission status",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE COMMISSION
// =====================================================

exports.deleteCommission = async (req, res) => {
  try {
    const commission =
      await Commission.findById(req.params.id);

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    await Commission.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Commission deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete commission error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete commission",
      error: error.message,
    });
  }
};