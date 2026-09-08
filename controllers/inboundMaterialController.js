const InboundMaterial = require("../models/InboundMaterial");

const generateGRNNumber = async () => {
  const year = new Date().getFullYear();

  const count = await InboundMaterial.countDocuments({
    grnNumber: {
      $regex: `^GRN-${year}-`,
    },
  });

  return `GRN-${year}-${String(
    count + 1
  ).padStart(4, "0")}`;
};

// ======================================================
// CREATE INBOUND MATERIAL / GRN
// ======================================================

const createInbound = async (req, res) => {
  try {
    const {
      poDate,
      vendor,
      material,
      category,
      quantityOrdered,
      receivedQuantity,
      eta,
      lrNumber,
      transport,
      freight,
      receivedDate,
      warehouse,
      billLocation,
      qualityCheck,
      quantityCheck,
      status,
      value,
      remarks,
    } = req.body;

    if (
      !vendor ||
      !material ||
      quantityOrdered === undefined ||
      !warehouse
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide vendor, material, quantity ordered and warehouse",
      });
    }

    const numericQuantityOrdered =
      Number(quantityOrdered);

    if (
      !Number.isFinite(
        numericQuantityOrdered
      ) ||
      numericQuantityOrdered <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity ordered must be greater than 0",
      });
    }

    let numericReceivedQuantity = 0;

    if (
      receivedQuantity !== undefined &&
      receivedQuantity !== ""
    ) {
      numericReceivedQuantity =
        Number(receivedQuantity);

      if (
        !Number.isFinite(
          numericReceivedQuantity
        ) ||
        numericReceivedQuantity < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Received quantity must be a valid number",
        });
      }
    }

    let numericFreight = 0;

    if (
      freight !== undefined &&
      freight !== ""
    ) {
      numericFreight = Number(freight);

      if (
        !Number.isFinite(numericFreight) ||
        numericFreight < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Freight must be a valid number",
        });
      }
    }

    let numericValue = 0;

    if (
      value !== undefined &&
      value !== ""
    ) {
      numericValue = Number(value);

      if (
        !Number.isFinite(numericValue) ||
        numericValue < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Value must be a valid number",
        });
      }
    }

    if (
      numericReceivedQuantity >
      numericQuantityOrdered
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Received quantity cannot be greater than quantity ordered",
      });
    }

    const grnNumber =
      await generateGRNNumber();

    const inbound =
      await InboundMaterial.create({
        grnNumber,

        grnDate: new Date(),

        poDate:
          poDate || null,

        vendor,

        material,

        category:
          category || "",

        quantityOrdered:
          numericQuantityOrdered,

        receivedQuantity:
          numericReceivedQuantity,

        eta:
          eta || null,

        lrNumber:
          lrNumber || "",

        transport:
          transport || "",

        freight:
          numericFreight,

        receivedDate:
          receivedDate || null,

        warehouse,

        billLocation:
          billLocation || "",

        qualityCheck:
          qualityCheck || "PENDING",

        quantityCheck:
          quantityCheck || "PENDING",

        status:
          status || "IN_TRANSIT",

        value:
          numericValue,

        remarks:
          remarks || "",

        createdBy:
          req.user?.userId || null,
      });

    const populatedInbound =
      await InboundMaterial.findById(
        inbound._id
      ).populate(
        "createdBy",
        "name email"
      );

    return res.status(201).json({
      success: true,
      message:
        "Inbound material / GRN created successfully",
      inbound:
        populatedInbound,
    });
  } catch (error) {
    console.error(
      "Create inbound error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create inbound material",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL INBOUND MATERIAL / GRNs
// ======================================================

const getInbounds = async (
  req,
  res
) => {
  try {
    const {
      status,
      qualityCheck,
      quantityCheck,
      vendor,
      warehouse,
      category,
      material,
      dateFrom,
      dateTo,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (qualityCheck) {
      filter.qualityCheck =
        qualityCheck;
    }

    if (quantityCheck) {
      filter.quantityCheck =
        quantityCheck;
    }

    if (vendor) {
      filter.vendor = {
        $regex: vendor,
        $options: "i",
      };
    }

    if (warehouse) {
      filter.warehouse = {
        $regex: warehouse,
        $options: "i",
      };
    }

    if (category) {
      filter.category = {
        $regex: category,
        $options: "i",
      };
    }

    if (material) {
      filter.material = {
        $regex: material,
        $options: "i",
      };
    }

    if (dateFrom || dateTo) {
      filter.grnDate = {};

      if (dateFrom) {
        const start =
          new Date(dateFrom);

        start.setHours(
          0,
          0,
          0,
          0
        );

        filter.grnDate.$gte = start;
      }

      if (dateTo) {
        const end =
          new Date(dateTo);

        end.setHours(
          23,
          59,
          59,
          999
        );

        filter.grnDate.$lte = end;
      }
    }

    const inbounds =
      await InboundMaterial.find(
        filter
      )
        .populate(
          "createdBy",
          "name email"
        )
        .sort({
          grnDate: -1,
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: inbounds.length,
      inbounds,
    });
  } catch (error) {
    console.error(
      "Get inbounds error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch inbound materials",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE INBOUND
// ======================================================

const getInboundById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const inbound =
      await InboundMaterial.findById(
        id
      ).populate(
        "createdBy",
        "name email"
      );

    if (!inbound) {
      return res.status(404).json({
        success: false,
        message:
          "Inbound material not found",
      });
    }

    return res.status(200).json({
      success: true,
      inbound,
    });
  } catch (error) {
    console.error(
      "Get inbound error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch inbound material",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE INBOUND
// ======================================================

const updateInbound = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
    };

    if (
      updateData.quantityOrdered !==
      undefined &&
      updateData.quantityOrdered !== ""
    ) {
      updateData.quantityOrdered =
        Number(
          updateData.quantityOrdered
        );
    }

    if (
      updateData.receivedQuantity !==
      undefined &&
      updateData.receivedQuantity !== ""
    ) {
      updateData.receivedQuantity =
        Number(
          updateData.receivedQuantity
        );
    }

    if (
      updateData.freight !==
      undefined &&
      updateData.freight !== ""
    ) {
      updateData.freight =
        Number(updateData.freight);
    }

    if (
      updateData.value !==
      undefined &&
      updateData.value !== ""
    ) {
      updateData.value =
        Number(updateData.value);
    }

    if (
      updateData.quantityOrdered !==
      undefined &&
      updateData.receivedQuantity !==
      undefined &&
      updateData.receivedQuantity >
      updateData.quantityOrdered
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Received quantity cannot be greater than quantity ordered",
      });
    }

    const inbound =
      await InboundMaterial.findByIdAndUpdate(
        id,
        updateData,
        {
          returnDocument: "after",
          runValidators: true,
        }
      ).populate(
        "createdBy",
        "name email"
      );

    if (!inbound) {
      return res.status(404).json({
        success: false,
        message:
          "Inbound material not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Inbound material updated successfully",
      inbound,
    });
  } catch (error) {
    console.error(
      "Update inbound error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update inbound material",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE STATUS
// ======================================================

const updateInboundStatus =
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "RECEIVED",
        "IN_TRANSIT",
        "PENDING_QC",
        "REJECTED",
        "CANCELLED",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid inbound status",
        });
      }

      const updateData = {
        status,
      };

      if (
        status === "RECEIVED"
      ) {
        if (
          !updateData.receivedDate
        ) {
          updateData.receivedDate =
            new Date();
        }
      }

      const inbound =
        await InboundMaterial.findByIdAndUpdate(
          id,
          updateData,
          {
            returnDocument: "after",
            runValidators: true,
          }
        ).populate(
          "createdBy",
          "name email"
        );

      if (!inbound) {
        return res.status(404).json({
          success: false,
          message:
            "Inbound material not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Inbound status updated successfully",
        inbound,
      });
    } catch (error) {
      console.error(
        "Update inbound status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update inbound status",
        error: error.message,
      });
    }
  };

// ======================================================
// UPDATE QUALITY CHECK
// ======================================================

const updateQualityCheck =
  async (req, res) => {
    try {
      const { id } = req.params;
      const { qualityCheck } =
        req.body;

      const allowedValues = [
        "PENDING",
        "APPROVED",
        "REJECTED",
      ];

      if (
        !allowedValues.includes(
          qualityCheck
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid quality check value",
        });
      }

      const updateData = {
        qualityCheck,
      };

      if (
        qualityCheck === "REJECTED"
      ) {
        updateData.status =
          "REJECTED";
      }

      if (
        qualityCheck === "APPROVED"
      ) {
        updateData.status =
          "RECEIVED";
        updateData.receivedDate =
          new Date();
      }

      const inbound =
        await InboundMaterial.findByIdAndUpdate(
          id,
          updateData,
          {
            returnDocument: "after",
            runValidators: true,
          }
        ).populate(
          "createdBy",
          "name email"
        );

      if (!inbound) {
        return res.status(404).json({
          success: false,
          message:
            "Inbound material not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Quality check updated successfully",
        inbound,
      });
    } catch (error) {
      console.error(
        "Quality check error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update quality check",
        error: error.message,
      });
    }
  };

// ======================================================
// UPDATE QUANTITY CHECK
// ======================================================

const updateQuantityCheck =
  async (req, res) => {
    try {
      const { id } = req.params;
      const { quantityCheck } =
        req.body;

      const allowedValues = [
        "PENDING",
        "PASSED",
        "MISMATCH",
      ];

      if (
        !allowedValues.includes(
          quantityCheck
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid quantity check value",
        });
      }

      const inbound =
        await InboundMaterial.findByIdAndUpdate(
          id,
          {
            quantityCheck,
          },
          {
            returnDocument: "after",
            runValidators: true,
          }
        ).populate(
          "createdBy",
          "name email"
        );

      if (!inbound) {
        return res.status(404).json({
          success: false,
          message:
            "Inbound material not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Quantity check updated successfully",
        inbound,
      });
    } catch (error) {
      console.error(
        "Quantity check error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update quantity check",
        error: error.message,
      });
    }
  };

// ======================================================
// DELETE INBOUND
// ======================================================

const deleteInbound = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const inbound =
      await InboundMaterial.findByIdAndDelete(
        id
      );

    if (!inbound) {
      return res.status(404).json({
        success: false,
        message:
          "Inbound material not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Inbound material deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete inbound error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete inbound material",
      error: error.message,
    });
  }
};

// ======================================================
// STATS
// ======================================================

const getInboundStats = async (
  req,
  res
) => {
  try {
    const [
      totalGRNs,
      inTransit,
      pendingQC,
      rejectedGRNs,
    ] = await Promise.all([
      InboundMaterial.countDocuments(),

      InboundMaterial.countDocuments({
        status: "IN_TRANSIT",
      }),

      InboundMaterial.countDocuments({
        status: "PENDING_QC",
      }),

      InboundMaterial.countDocuments({
        status: "REJECTED",
      }),
    ]);

    const quantityResult =
      await InboundMaterial.aggregate([
        {
          $group: {
            _id: null,
            totalQuantity: {
              $sum: "$quantityOrdered",
            },
          },
        },
      ]);

    const valueResult =
      await InboundMaterial.aggregate([
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: "$value",
            },
          },
        },
      ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalGRNs,
        totalQuantity:
          quantityResult[0]
            ?.totalQuantity || 0,
        totalValue:
          valueResult[0]
            ?.totalValue || 0,
        inTransit,
        pendingQC,
        rejectedGRNs,
      },
    });
  } catch (error) {
    console.error(
      "Inbound stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch inbound statistics",
      error: error.message,
    });
  }
};

// ======================================================
// OVERVIEW
// ======================================================

const getInboundOverview =
  async (req, res) => {
    try {
      const [
        statusData,
        trendData,
        supplierData,
        recentInbounds,
      ] = await Promise.all([
        InboundMaterial.aggregate([
          {
            $group: {
              _id: "$status",
              count: {
                $sum: 1,
              },
              quantity: {
                $sum: "$quantityOrdered",
              },
            },
          },
          {
            $sort: {
              count: -1,
            },
          },
        ]),

        InboundMaterial.aggregate([
          {
            $group: {
              _id: {
                year: {
                  $year:
                    "$grnDate",
                },
                month: {
                  $month:
                    "$grnDate",
                },
              },
              count: {
                $sum: 1,
              },
              quantity: {
                $sum: "$quantityOrdered",
              },
              value: {
                $sum: "$value",
              },
            },
          },
          {
            $sort: {
              "_id.year": 1,
              "_id.month": 1,
            },
          },
        ]),

        InboundMaterial.aggregate([
          {
            $match: {
              vendor: {
                $nin: [
                  null,
                  "",
                ],
              },
            },
          },
          {
            $group: {
              _id: "$vendor",
              grnCount: {
                $sum: 1,
              },
              value: {
                $sum: "$value",
              },
            },
          },
          {
            $sort: {
              value: -1,
            },
          },
          {
            $limit: 5,
          },
        ]),

        InboundMaterial.find()
          .populate(
            "createdBy",
            "name email"
          )
          .sort({
            grnDate: -1,
            createdAt: -1,
          })
          .limit(10),
      ]);

      return res.status(200).json({
        success: true,
        overview: {
          statusData,
          trendData,
          supplierData,
          recentInbounds,
        },
      });
    } catch (error) {
      console.error(
        "Inbound overview error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch inbound overview",
        error: error.message,
      });
    }
  };

// ======================================================
// SUMMARY
// ======================================================

const getInboundSummary = async (
  req,
  res
) => {
  try {
    const [
      totalGRNs,
      pendingQC,
      rejectedGRNs,
      cancelledGRNs,
      totals,
    ] = await Promise.all([
      InboundMaterial.countDocuments(),

      InboundMaterial.countDocuments({
        qualityCheck: "PENDING",
      }),

      InboundMaterial.countDocuments({
        status: "REJECTED",
      }),

      InboundMaterial.countDocuments({
        status: "CANCELLED",
      }),

      InboundMaterial.aggregate([
        {
          $group: {
            _id: null,
            totalQuantity: {
              $sum: "$quantityOrdered",
            },
            totalValue: {
              $sum: "$value",
            },
            averageValue: {
              $avg: "$value",
            },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      summary: {
        totalGRNs,
        totalQuantity:
          totals[0]?.totalQuantity ||
          0,
        totalValue:
          totals[0]?.totalValue ||
          0,
        averageGRNValue:
          totals[0]?.averageValue ||
          0,
        pendingQC,
        rejectedGRNs,
        cancelledGRNs,
      },
    });
  } catch (error) {
    console.error(
      "Inbound summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch inbound summary",
      error: error.message,
    });
  }
};

// ======================================================
// ALERTS
// ======================================================

const getInboundAlerts = async (
  req,
  res
) => {
  try {
    const [
      pendingQC,
      rejected,
      inTransit,
      quantityMismatch,
    ] = await Promise.all([
      InboundMaterial.find({
        qualityCheck: "PENDING",
      })
        .sort({
          grnDate: 1,
        })
        .limit(10),

      InboundMaterial.find({
        status: "REJECTED",
      })
        .sort({
          grnDate: -1,
        })
        .limit(10),

      InboundMaterial.find({
        status: "IN_TRANSIT",
      })
        .sort({
          eta: 1,
          grnDate: 1,
        })
        .limit(10),

      InboundMaterial.find({
        quantityCheck: "MISMATCH",
      })
        .sort({
          grnDate: -1,
        })
        .limit(10),
    ]);

    return res.status(200).json({
      success: true,
      alerts: {
        pendingQC,
        rejected,
        inTransit,
        quantityMismatch,
      },
    });
  } catch (error) {
    console.error(
      "Inbound alerts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch inbound alerts",
      error: error.message,
    });
  }
};

// ======================================================
// MONTHLY STATS
// ======================================================

const getMonthlyInboundStats =
  async (req, res) => {
    try {
      const year =
        Number(req.query.year) ||
        new Date().getFullYear();

      const monthlyStats =
        await InboundMaterial.aggregate([
          {
            $match: {
              grnDate: {
                $gte: new Date(
                  `${year}-01-01T00:00:00.000Z`
                ),
                $lt: new Date(
                  `${year + 1}-01-01T00:00:00.000Z`
                ),
              },
            },
          },
          {
            $group: {
              _id: {
                month: {
                  $month:
                    "$grnDate",
                },
                status:
                  "$status",
              },
              count: {
                $sum: 1,
              },
              quantity: {
                $sum: "$quantityOrdered",
              },
              value: {
                $sum: "$value",
              },
            },
          },
          {
            $sort: {
              "_id.month": 1,
            },
          },
        ]);

      return res.status(200).json({
        success: true,
        year,
        monthlyStats,
      });
    } catch (error) {
      console.error(
        "Monthly inbound stats error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch monthly inbound statistics",
        error: error.message,
      });
    }
  };

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createInbound,
  getInbounds,
  getInboundById,
  updateInbound,
  updateInboundStatus,
  updateQualityCheck,
  updateQuantityCheck,
  deleteInbound,
  getInboundStats,
  getInboundOverview,
  getInboundSummary,
  getInboundAlerts,
  getMonthlyInboundStats,
};