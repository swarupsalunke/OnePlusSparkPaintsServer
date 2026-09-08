const BatchCostVerification = require("../models/BatchCostVerification");
const ManufacturingBatch = require("../models/ManufacturingBatch");

const createCostVerification = async (req, res) => {
  try {
    const {
      product,
      batch,
      batchNumber,
      producedQuantity,
      finishedQuantity,
      costComparison,
      productCostVerification,
      packingWiseCost,
      remarks,
    } = req.body;

    // Required fields
    if (
      !product ||
      !batch ||
      !batchNumber ||
      producedQuantity === undefined ||
      finishedQuantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required cost verification fields",
      });
    }

    // Check batch
    const existingBatch =
      await ManufacturingBatch.findById(batch);

    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message:
          "Manufacturing batch not found",
      });
    }

    // Prevent duplicate verification for same batch
    const existingVerification =
      await BatchCostVerification.findOne({
        batch,
      });

    if (existingVerification) {
      return res.status(400).json({
        success: false,
        message:
          "Cost verification already exists for this batch",
      });
    }

    const verification =
      await BatchCostVerification.create({
        product,
        batch,
        batchNumber,
        producedQuantity,
        finishedQuantity,
        costComparison:
          costComparison ?? 0,
        productCostVerification:
          productCostVerification ?? 0,
        packingWiseCost:
          packingWiseCost ?? 0,
        remarks: remarks || "",
        approvalStatus: "PENDING",
      });

    const populatedVerification =
      await BatchCostVerification.findById(
        verification._id
      )
        .populate(
          "product",
          "productName sku category brand"
        )
        .populate(
          "batch",
          "batchNumber batchName batchDate status"
        );

    res.status(201).json({
      success: true,
      message:
        "Batch cost verification created successfully",
      verification:
        populatedVerification,
    });
  } catch (error) {
    console.error(
      "Create cost verification error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create batch cost verification",
      error: error.message,
    });
  }
};

// ======================================================
// GET COST VERIFICATION BY BATCH
// ======================================================

const getCostVerification = async (req, res) => {
  try {
    const { batchId } = req.params;

    const verification =
      await BatchCostVerification.findOne({
        batch: batchId,
      })
        .populate(
          "product",
          "productName sku category brand"
        )
        .populate(
          "batch",
          "batchNumber batchName batchDate status"
        )
        .populate(
          "verifiedBy",
          "name email"
        );

    if (!verification) {
      return res.status(404).json({
        success: false,
        message:
          "Batch cost verification not found",
      });
    }

    res.status(200).json({
      success: true,
      verification,
    });
  } catch (error) {
    console.error(
      "Get cost verification error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch batch cost verification",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE COST VERIFICATION
// ======================================================

const updateCostVerification = async (
  req,
  res
) => {
  try {
    const { batchId } = req.params;

    const verification =
      await BatchCostVerification.findOne({
        batch: batchId,
      });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message:
          "Batch cost verification not found",
      });
    }

    // Do not modify an already verified record
    if (
      verification.approvalStatus ===
      "VERIFIED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Verified cost record cannot be modified",
      });
    }

    const allowedFields = [
      "product",
      "batchNumber",
      "producedQuantity",
      "finishedQuantity",
      "costComparison",
      "productCostVerification",
      "packingWiseCost",
      "remarks",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        verification[field] =
          req.body[field];
      }
    });

    await verification.save();

    const updatedVerification =
      await BatchCostVerification.findById(
        verification._id
      )
        .populate(
          "product",
          "productName sku category brand"
        )
        .populate(
          "batch",
          "batchNumber batchName batchDate status"
        )
        .populate(
          "verifiedBy",
          "name email"
        );

    res.status(200).json({
      success: true,
      message:
        "Batch cost verification updated successfully",
      verification:
        updatedVerification,
    });
  } catch (error) {
    console.error(
      "Update cost verification error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update batch cost verification",
      error: error.message,
    });
  }
};

// ======================================================
// VERIFY COST
// ======================================================

const verifyCost = async (req, res) => {
  try {
    const { batchId } = req.params;

    const verification =
      await BatchCostVerification.findOne({
        batch: batchId,
      });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message:
          "Batch cost verification not found",
      });
    }

    if (
      verification.approvalStatus ===
      "VERIFIED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cost verification is already verified",
      });
    }

    verification.approvalStatus =
      "VERIFIED";

    verification.verifiedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    verification.verifiedOn =
      new Date();

    await verification.save();

    const updatedVerification =
      await BatchCostVerification.findById(
        verification._id
      )
        .populate(
          "product",
          "productName sku category brand"
        )
        .populate(
          "batch",
          "batchNumber batchName batchDate status"
        )
        .populate(
          "verifiedBy",
          "name email"
        );

    res.status(200).json({
      success: true,
      message:
        "Batch cost verification verified successfully",
      verification:
        updatedVerification,
    });
  } catch (error) {
    console.error(
      "Verify cost error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to verify batch cost",
      error: error.message,
    });
  }
};

// ======================================================
// REJECT COST
// ======================================================

const rejectCost = async (req, res) => {
  try {
    const { batchId } = req.params;

    const verification =
      await BatchCostVerification.findOne({
        batch: batchId,
      });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message:
          "Batch cost verification not found",
      });
    }

    if (
      verification.approvalStatus ===
      "VERIFIED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Verified cost cannot be rejected",
      });
    }

    verification.approvalStatus =
      "REJECTED";

    verification.verifiedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    verification.verifiedOn =
      new Date();

    if (req.body?.remarks !== undefined) {
      verification.remarks =
        req.body.remarks;
    }

    await verification.save();

    const updatedVerification =
      await BatchCostVerification.findById(
        verification._id
      )
        .populate(
          "product",
          "productName sku category brand"
        )
        .populate(
          "batch",
          "batchNumber batchName batchDate status"
        )
        .populate(
          "verifiedBy",
          "name email"
        );

    res.status(200).json({
      success: true,
      message:
        "Batch cost verification rejected successfully",
      verification:
        updatedVerification,
    });
  } catch (error) {
    console.error(
      "Reject cost error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to reject batch cost verification",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createCostVerification,
  getCostVerification,
  updateCostVerification,
  verifyCost,
  rejectCost,
};