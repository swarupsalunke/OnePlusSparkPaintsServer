const ManufacturingBatch = require("../models/ManufacturingBatch");
const Product = require("../models/Product");

// ======================================================
// GET BATCH STATISTICS
// ======================================================

const getBatchStats = async (req, res) => {
  try {
    const [
      totalBatches,
      inProduction,
      completed,
      qcPending,
      rejected,
    ] = await Promise.all([
      ManufacturingBatch.countDocuments(),

      ManufacturingBatch.countDocuments({
        status: "IN_PRODUCTION",
      }),

      ManufacturingBatch.countDocuments({
        status: "COMPLETED",
      }),

      ManufacturingBatch.countDocuments({
        status: "QC_PENDING",
      }),

      ManufacturingBatch.countDocuments({
        status: "REJECTED",
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalBatches,
        inProduction,
        completed,
        qcPending,
        rejected,
      },
    });
  } catch (error) {
    console.error(
      "Get manufacturing batch stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch batch statistics",
    });
  }
};

// ======================================================
// CREATE BATCH
// ======================================================

const createBatch = async (req, res) => {
  try {
    const {
      batchNumber,
      batchDate,
      batchName,
      product,
      plantUnit,
      supervisor,
      batchStartTime,
      batchEndTime,
      batchQuantity,
      batchSize,
      customBatchSize,
      numberOfOperators,
      remarks,
      status,
      packingDetails,
      labelVerification,
      labQualityControl,
    } = req.body;

    // Required fields
    if (
      !batchNumber ||
      !batchDate ||
      !batchName ||
      !product ||
      !plantUnit ||
      !supervisor ||
      batchQuantity === undefined ||
      !batchSize ||
      numberOfOperators === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required batch fields",
      });
    }

    // Custom batch size validation
    if (
      batchSize === "CUSTOM" &&
      (customBatchSize === undefined ||
        customBatchSize === null ||
        Number(customBatchSize) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Custom batch size is required when batch size is CUSTOM",
      });
    }

    // Check product
    const existingProduct =
      await Product.findById(product);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check duplicate batch number
    const existingBatch =
      await ManufacturingBatch.findOne({
        batchNumber,
      });

    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: "Batch number already exists",
      });
    }

    const batch = await ManufacturingBatch.create({
      batchNumber,
      batchDate,
      batchName,
      product,
      plantUnit,
      supervisor,
      batchStartTime: batchStartTime || null,
      batchEndTime: batchEndTime || null,
      batchQuantity,
      batchSize,
      customBatchSize:
        batchSize === "CUSTOM"
          ? customBatchSize
          : null,
      numberOfOperators,
      remarks: remarks || "",
      status: status || "PLANNED",
      packingDetails:
        Array.isArray(packingDetails)
          ? packingDetails
          : [],
      labelVerification:
        Boolean(labelVerification),
      labQualityControl:
        labQualityControl || {},
    });

    const populatedBatch =
      await ManufacturingBatch.findById(
        batch._id
      )
        .populate(
          "product",
          "productName sku category brand packingSize"
        )
        .populate(
          "supervisor",
          "name email"
        );

    res.status(201).json({
      success: true,
      message: "Manufacturing batch created successfully",
      batch: populatedBatch,
    });
  } catch (error) {
    console.error(
      "Create manufacturing batch error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create manufacturing batch",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL BATCHES
// ======================================================

const getBatches = async (req, res) => {
  try {
    const {
      search,
      status,
      product,
      plantUnit,
      supervisor,
      dateFrom,
      dateTo,
    } = req.query;

    const filter = {};

    // Search by batch number / batch name
    if (search) {
      filter.$or = [
        {
          batchNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          batchName: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (product) {
      filter.product = product;
    }

    if (plantUnit) {
      filter.plantUnit = plantUnit;
    }

    if (supervisor) {
      filter.supervisor = supervisor;
    }

    // Date range
    if (dateFrom || dateTo) {
      filter.batchDate = {};

      if (dateFrom) {
        const startDate = new Date(dateFrom);
        startDate.setHours(0, 0, 0, 0);

        filter.batchDate.$gte = startDate;
      }

      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);

        filter.batchDate.$lte = endDate;
      }
    }

    const batches =
      await ManufacturingBatch.find(filter)
        .populate(
          "product",
          "productName sku category brand"
        )
        .populate(
          "supervisor",
          "name email"
        )
        .populate(
          "closedBy",
          "name email"
        )
        .sort({
          batchDate: -1,
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: batches.length,
      batches,
    });
  } catch (error) {
    console.error(
      "Get manufacturing batches error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch manufacturing batches",
    });
  }
};

// ======================================================
// GET SINGLE BATCH
// ======================================================

const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const batch =
      await ManufacturingBatch.findById(id)
        .populate(
          "product",
          "productName sku category brand packingSize mrp"
        )
        .populate(
          "supervisor",
          "name email"
        )
        .populate(
          "closedBy",
          "name email"
        )
        .populate(
          "labQualityControl.approvedBy",
          "name email"
        );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Manufacturing batch not found",
      });
    }

    res.status(200).json({
      success: true,
      batch,
    });
  } catch (error) {
    console.error(
      "Get manufacturing batch error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch manufacturing batch",
    });
  }
};

// ======================================================
// UPDATE BATCH
// ======================================================

const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch =
      await ManufacturingBatch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Manufacturing batch not found",
      });
    }

    // Do not allow editing a closed batch
    if (batch.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Completed batch cannot be edited",
      });
    }

    const allowedFields = [
      "batchDate",
      "batchName",
      "product",
      "plantUnit",
      "supervisor",
      "batchStartTime",
      "batchEndTime",
      "batchQuantity",
      "batchSize",
      "customBatchSize",
      "numberOfOperators",
      "remarks",
      "status",
      "packingDetails",
      "labelVerification",
      "labQualityControl",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        batch[field] = req.body[field];
      }
    });

    if (batch.batchSize !== "CUSTOM") {
      batch.customBatchSize = null;
    }

    await batch.save();

    const updatedBatch =
      await ManufacturingBatch.findById(
        batch._id
      )
        .populate(
          "product",
          "productName sku category brand"
        )
        .populate(
          "supervisor",
          "name email"
        );

    res.status(200).json({
      success: true,
      message: "Manufacturing batch updated successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error(
      "Update manufacturing batch error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update manufacturing batch",
      error: error.message,
    });
  }
};

// ======================================================
// CLOSE BATCH
// ======================================================

const closeBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch =
      await ManufacturingBatch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Manufacturing batch not found",
      });
    }

    if (batch.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Batch is already closed",
      });
    }

    batch.status = "COMPLETED";
    batch.closedOn = new Date();

    batch.closedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    if (!batch.batchEndTime) {
      batch.batchEndTime = new Date();
    }

    await batch.save();

    const closedBatch =
      await ManufacturingBatch.findById(
        batch._id
      )
        .populate(
          "product",
          "productName sku category brand"
        )
        .populate(
          "supervisor",
          "name email"
        )
        .populate(
          "closedBy",
          "name email"
        );

    res.status(200).json({
      success: true,
      message: "Batch closed successfully",
      batch: closedBatch,
    });
  } catch (error) {
    console.error(
      "Close manufacturing batch error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to close manufacturing batch",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE LAB QUALITY CONTROL
// ======================================================

const updateBatchQC = async (req, res) => {
  try {
    const { id } = req.params;

    const batch =
      await ManufacturingBatch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Manufacturing batch not found",
      });
    }

    const {
      captureDateTime,
      wetPerLitre,
      temperature,
      viscosity,
      drawDownResult,
      hegmanFineness,
      labReport,
      qcRemarks,
      qcStatus,
    } = req.body;

    batch.labQualityControl = {
      ...(batch.labQualityControl?.toObject
        ? batch.labQualityControl.toObject()
        : batch.labQualityControl),

      captureDateTime:
        captureDateTime ??
        batch.labQualityControl?.captureDateTime ??
        null,

      wetPerLitre:
        wetPerLitre ??
        batch.labQualityControl?.wetPerLitre ??
        null,

      temperature:
        temperature ??
        batch.labQualityControl?.temperature ??
        null,

      viscosity:
        viscosity ??
        batch.labQualityControl?.viscosity ??
        null,

      drawDownResult:
        drawDownResult ??
        batch.labQualityControl?.drawDownResult ??
        "",

      hegmanFineness:
        hegmanFineness ??
        batch.labQualityControl?.hegmanFineness ??
        null,

      labReport:
        labReport ??
        batch.labQualityControl?.labReport ??
        "",

      qcRemarks:
        qcRemarks ??
        batch.labQualityControl?.qcRemarks ??
        "",

      qcStatus:
        qcStatus ||
        batch.labQualityControl?.qcStatus ||
        "PENDING",

      approvedBy:
        qcStatus === "APPROVED"
          ? req.user?.id ||
          req.user?._id ||
          batch.labQualityControl?.approvedBy ||
          null
          : batch.labQualityControl?.approvedBy ||
          null,
    };

    if (
      batch.labQualityControl.qcStatus ===
      "APPROVED"
    ) {
      batch.status = "COMPLETED";
    } else if (
      batch.labQualityControl.qcStatus ===
      "REJECTED"
    ) {
      batch.status = "REJECTED";
    } else {
      batch.status = "QC_PENDING";
    }

    await batch.save();

    const updatedBatch =
      await ManufacturingBatch.findById(
        batch._id
      )
        .populate(
          "product",
          "productName sku category brand"
        )
        .populate(
          "supervisor",
          "name email"
        )
        .populate(
          "labQualityControl.approvedBy",
          "name email"
        );

    res.status(200).json({
      success: true,
      message: "Batch QC updated successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error(
      "Update batch QC error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update batch QC",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE BATCH
// ======================================================

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await ManufacturingBatch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Manufacturing batch not found",
      });
    }

    await ManufacturingBatch.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Manufacturing batch deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete manufacturing batch error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete manufacturing batch",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getBatchStats,
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  closeBatch,
  updateBatchQC,
  deleteBatch,
};