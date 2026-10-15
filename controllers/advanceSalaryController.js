const AdvanceSalary = require("../models/advanceSalaryModel");

// Create Advance Salary Request
exports.createAdvanceSalary = async (req, res) => {
  try {
    const {
      employee,
      requestAmount,
      reason,
      requiredDate,
      repaymentMethod,
      remarks,
    } = req.body;

    if (
      !employee ||
      requestAmount === undefined ||
      !reason ||
      !requiredDate ||
      !repaymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Employee, request amount, reason, required date and repayment method are required",
      });
    }

    const advanceSalary = await AdvanceSalary.create({
      employee,
      requestAmount,
      reason,
      requiredDate,
      repaymentMethod,
      remarks: remarks || "",
    });

    await advanceSalary.populate([
      {
        path: "employee",
        select: "name email",
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Advance salary request created successfully",
      advanceSalary,
    });
  } catch (error) {
    console.error("Create advance salary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create advance salary request",
      error: error.message,
    });
  }
};


// Get All Advance Salary Requests
exports.getAllAdvanceSalary = async (req, res) => {
  try {
    const advanceSalary = await AdvanceSalary.find()
      .populate("employee", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: advanceSalary.length,
      advanceSalary,
    });
  } catch (error) {
    console.error("Get advance salary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch advance salary requests",
      error: error.message,
    });
  }
};


// Get Single Advance Salary Request
exports.getAdvanceSalaryById = async (req, res) => {
  try {
    const advanceSalary = await AdvanceSalary.findById(req.params.id)
      .populate("employee", "name email")
      .populate("approvedBy", "name email");

    if (!advanceSalary) {
      return res.status(404).json({
        success: false,
        message: "Advance salary request not found",
      });
    }

    res.status(200).json({
      success: true,
      advanceSalary,
    });
  } catch (error) {
    console.error("Get advance salary by id error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch advance salary request",
      error: error.message,
    });
  }
};


// Update Advance Salary Request
exports.updateAdvanceSalary = async (req, res) => {
  try {
    const advanceSalary = await AdvanceSalary.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    )
      .populate("employee", "name email")
      .populate("approvedBy", "name email");

    if (!advanceSalary) {
      return res.status(404).json({
        success: false,
        message: "Advance salary request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Advance salary request updated successfully",
      advanceSalary,
    });
  } catch (error) {
    console.error("Update advance salary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update advance salary request",
      error: error.message,
    });
  }
};


// Approve / Reject Advance Salary Request
exports.updateAdvanceSalaryApproval = async (req, res) => {
  try {
    const { approvalStatus, approvedBy, remarks } = req.body;

    if (!["APPROVED", "REJECTED"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Approval status must be APPROVED or REJECTED",
      });
    }

    const advanceSalary = await AdvanceSalary.findById(
      req.params.id
    );

    if (!advanceSalary) {
      return res.status(404).json({
        success: false,
        message: "Advance salary request not found",
      });
    }

    advanceSalary.approvalStatus = approvalStatus;

    if (approvalStatus === "APPROVED") {
      advanceSalary.approvedBy = approvedBy || null;
      advanceSalary.approvedAt = new Date();
    } else {
      advanceSalary.approvedBy = null;
      advanceSalary.approvedAt = null;
    }

    if (remarks !== undefined) {
      advanceSalary.remarks = remarks;
    }

    await advanceSalary.save();

    await advanceSalary.populate([
      {
        path: "employee",
        select: "name email",
      },
      {
        path: "approvedBy",
        select: "name email",
      },
    ]);

    res.status(200).json({
      success: true,
      message: `Advance salary request ${approvalStatus.toLowerCase()} successfully`,
      advanceSalary,
    });
  } catch (error) {
    console.error("Advance salary approval error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update advance salary approval",
      error: error.message,
    });
  }
};


// Delete Advance Salary Request
exports.deleteAdvanceSalary = async (req, res) => {
  try {
    const advanceSalary = await AdvanceSalary.findByIdAndDelete(
      req.params.id
    );

    if (!advanceSalary) {
      return res.status(404).json({
        success: false,
        message: "Advance salary request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Advance salary request deleted successfully",
    });
  } catch (error) {
    console.error("Delete advance salary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete advance salary request",
      error: error.message,
    });
  }
};