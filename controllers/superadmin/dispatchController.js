const Dispatch = require("../../models/superadmin/Dispatch");

const generateDispatchNumber = async () => {
  const year = new Date().getFullYear();

  const count = await Dispatch.countDocuments({
    dispatchNumber: {
      $regex: `^DSP-${year}-`,
    },
  });

  return `DSP-${year}-${String(
    count + 1
  ).padStart(4, "0")}`;
};

// ======================================================
// GET UPLOADED FILE DATA
// ======================================================

const getUploadedFiles = (req) => {
  const files = req.files || {};

  return {
    pod:
      files.pod?.[0]?.path || "",

    invoiceUpload:
      files.invoiceUpload?.[0]?.path || "",

    deliveryChallan:
      files.deliveryChallan?.[0]?.path || "",

    acknowledgement:
      files.acknowledgement?.[0]?.path || "",

    vehiclePhotos:
      files.vehiclePhotos
        ? files.vehiclePhotos.map(
          (file) => file.path
        )
        : [],
  };
};

// ======================================================
// CREATE DISPATCH
// ======================================================


const createDispatch = async (req, res) => {
  try {
    const {
      customer,
      invoice,
      route,
      destination,
      orderedQuantity,
      quantity,
      unit,
      driver,
      vehicle,
      transportMode,
      transporter,
      dispatchTeam,
      status,
      remarks,
      dispatchDate,
    } = req.body;

    // Required fields validation
    if (
      !customer ||
      !invoice ||
      orderedQuantity === undefined ||
      quantity === undefined ||
      !unit
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide customer, invoice, ordered quantity, dispatch quantity and unit",
      });
    }

    const numericOrderedQuantity = Number(orderedQuantity);
    const numericQuantity = Number(quantity);

    if (
      !Number.isFinite(numericOrderedQuantity) ||
      numericOrderedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Ordered quantity must be greater than 0",
      });
    }

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Dispatch quantity must be greater than 0",
      });
    }

    if (numericQuantity > numericOrderedQuantity) {
      return res.status(400).json({
        success: false,
        message: "Dispatch quantity cannot exceed ordered quantity",
      });
    }

    // Find existing dispatches for the same customer and invoice
    const existingDispatches = await Dispatch.find({
      customer: customer.trim(),
      invoice: invoice.trim(),
    });

    // Check ordered quantity consistency
    if (
      existingDispatches.length > 0 &&
      existingDispatches.some(
        (item) =>
          Number(item.orderedQuantity) !== numericOrderedQuantity
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Ordered quantity must remain the same for this invoice",
      });
    }

    // Calculate already dispatched quantity
    const previousDispatchedQuantity =
      existingDispatches.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      );

    const totalDispatchedQuantity =
      previousDispatchedQuantity + numericQuantity;

    // Prevent dispatching more than the ordered quantity
    if (totalDispatchedQuantity > numericOrderedQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${numericOrderedQuantity - previousDispatchedQuantity
          } quantity is remaining for this invoice`,
      });
    }

    // Calculate fulfillment status
    const fulfillmentStatus =
      totalDispatchedQuantity >= numericOrderedQuantity
        ? "COMPLETE"
        : "PARTIAL";

    const uploadedFiles = getUploadedFiles(req);

    const dispatchNumber = await generateDispatchNumber();

    // Create new dispatch entry
    const dispatch = await Dispatch.create({
      dispatchNumber,

      dispatchDate: dispatchDate || new Date(),

      customer: customer.trim(),
      invoice: invoice.trim(),

      route: route || "",
      destination: destination || "",

      orderedQuantity: numericOrderedQuantity,
      quantity: numericQuantity,
      unit,

      fulfillmentStatus,

      driver: driver || "",
      vehicle: vehicle || "",
      transportMode: transportMode || "",
      transporter: transporter || "",

      dispatchTeam: Array.isArray(dispatchTeam)
        ? dispatchTeam
        : dispatchTeam
          ? [dispatchTeam]
          : [],

      pod: uploadedFiles.pod,
      vehiclePhotos: uploadedFiles.vehiclePhotos,
      invoiceUpload: uploadedFiles.invoiceUpload,
      deliveryChallan: uploadedFiles.deliveryChallan,
      acknowledgement: uploadedFiles.acknowledgement,

      status: status || "PENDING",
      remarks: remarks || "",

      createdBy: req.user?.userId || null,
    });

    // Keep fulfillment status synchronized across all
    // dispatch entries belonging to this invoice
    await Dispatch.updateMany(
      {
        customer: customer.trim(),
        invoice: invoice.trim(),
      },
      {
        $set: {
          fulfillmentStatus,
        },
      }
    );

    const populatedDispatch = await Dispatch.findById(
      dispatch._id
    ).populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Dispatch created successfully",
      dispatch: populatedDispatch,
      fulfillment: {
        orderedQuantity: numericOrderedQuantity,
        dispatchedQuantity: totalDispatchedQuantity,
        pendingQuantity:
          numericOrderedQuantity - totalDispatchedQuantity,
        fulfillmentStatus,
      },
    });
  } catch (error) {
    console.error("Create dispatch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create dispatch",
      error: error.message,
    });
  }
};


// ======================================================
// GET ALL DISPATCHES
// ======================================================

const getDispatches = async (
  req,
  res
) => {
  try {
    const {
      search,
      status,
      customer,
      transporter,
      vehicle,
      dateFrom,
      dateTo,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (customer) {
      filter.customer = {
        $regex: customer,
        $options: "i",
      };
    }

    if (transporter) {
      filter.transporter = {
        $regex: transporter,
        $options: "i",
      };
    }

    if (vehicle) {
      filter.vehicle = {
        $regex: vehicle,
        $options: "i",
      };
    }

    if (search) {
      filter.$or = [
        {
          dispatchNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          invoice: {
            $regex: search,
            $options: "i",
          },
        },
        {
          customer: {
            $regex: search,
            $options: "i",
          },
        },
        {
          vehicle: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (dateFrom || dateTo) {
      filter.dispatchDate = {};

      if (dateFrom) {
        const start =
          new Date(dateFrom);

        start.setHours(
          0,
          0,
          0,
          0
        );

        filter.dispatchDate.$gte =
          start;
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

        filter.dispatchDate.$lte =
          end;
      }
    }

    const dispatches =
      await Dispatch.find(filter)
        .populate(
          "createdBy",
          "name email"
        )
        .sort({
          dispatchDate: -1,
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: dispatches.length,
      dispatches,
    });
  } catch (error) {
    console.error(
      "Get dispatches error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch dispatches",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE DISPATCH
// ======================================================

const getDispatchById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const dispatch =
      await Dispatch.findById(id)
        .populate(
          "createdBy",
          "name email"
        );

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message:
          "Dispatch not found",
      });
    }

    return res.status(200).json({
      success: true,
      dispatch,
    });
  } catch (error) {
    console.error(
      "Get dispatch error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch dispatch",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE DISPATCH
// ======================================================


const updateDispatch = async (req, res) => {
  try {
    const { id } = req.params;

    const existingDispatch = await Dispatch.findById(id);

    if (!existingDispatch) {
      return res.status(404).json({
        success: false,
        message: "Dispatch not found",
      });
    }

    const updateData = { ...req.body };

    // Prepare customer and invoice
    const customer =
      updateData.customer?.trim() || existingDispatch.customer;

    const invoice =
      updateData.invoice?.trim() || existingDispatch.invoice;

    // Prepare quantities
    const orderedQuantity =
      updateData.orderedQuantity !== undefined
        ? Number(updateData.orderedQuantity)
        : Number(existingDispatch.orderedQuantity);

    const quantity =
      updateData.quantity !== undefined
        ? Number(updateData.quantity)
        : Number(existingDispatch.quantity);

    if (
      !Number.isFinite(orderedQuantity) ||
      orderedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Ordered quantity must be greater than 0",
      });
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Dispatch quantity must be greater than 0",
      });
    }

    // Find other dispatch entries for this invoice
    const otherDispatches = await Dispatch.find({
      customer,
      invoice,
      _id: { $ne: id },
    });

    // Keep ordered quantity consistent
    const inconsistentOrder = otherDispatches.some(
      (item) =>
        Number(item.orderedQuantity) !== orderedQuantity
    );

    if (inconsistentOrder) {
      return res.status(400).json({
        success: false,
        message:
          "Ordered quantity must remain the same for this invoice",
      });
    }

    // Calculate cumulative dispatched quantity
    const previousQuantity = otherDispatches.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );

    const totalDispatchedQuantity =
      previousQuantity + quantity;

    if (totalDispatchedQuantity > orderedQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${orderedQuantity - previousQuantity
          } quantity is remaining for this invoice`,
      });
    }

    // Update fields
    updateData.customer = customer;
    updateData.invoice = invoice;
    updateData.orderedQuantity = orderedQuantity;
    updateData.quantity = quantity;

    // Fulfillment status is calculated, not manually edited
    delete updateData.fulfillmentStatus;

    // Convert dispatch team
    if (typeof updateData.dispatchTeam === "string") {
      try {
        const parsed = JSON.parse(updateData.dispatchTeam);

        updateData.dispatchTeam = Array.isArray(parsed)
          ? parsed
          : [updateData.dispatchTeam];
      } catch {
        updateData.dispatchTeam = [
          updateData.dispatchTeam,
        ];
      }
    }

    // Handle uploaded files
    const uploadedFiles = getUploadedFiles(req);

    if (uploadedFiles.pod) {
      updateData.pod = uploadedFiles.pod;
    }

    if (uploadedFiles.invoiceUpload) {
      updateData.invoiceUpload =
        uploadedFiles.invoiceUpload;
    }

    if (uploadedFiles.deliveryChallan) {
      updateData.deliveryChallan =
        uploadedFiles.deliveryChallan;
    }

    if (uploadedFiles.acknowledgement) {
      updateData.acknowledgement =
        uploadedFiles.acknowledgement;
    }

    if (uploadedFiles.vehiclePhotos.length > 0) {
      updateData.vehiclePhotos =
        uploadedFiles.vehiclePhotos;
    }

    // Update dispatch record
    const dispatch = await Dispatch.findByIdAndUpdate(
      id,
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).populate("createdBy", "name email");

    // Recalculate fulfillment status for an invoice group
    const syncFulfillmentStatus = async (
      groupCustomer,
      groupInvoice
    ) => {
      const records = await Dispatch.find({
        customer: groupCustomer,
        invoice: groupInvoice,
      });

      if (!records.length) return;

      const groupOrderedQuantity =
        Number(records[0].orderedQuantity);

      const groupDispatchedQuantity =
        records.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0
        );

      const fulfillmentStatus =
        groupDispatchedQuantity === 0
          ? "PENDING"
          : groupDispatchedQuantity >= groupOrderedQuantity
            ? "COMPLETE"
            : "PARTIAL";

      await Dispatch.updateMany(
        {
          customer: groupCustomer,
          invoice: groupInvoice,
        },
        {
          $set: { fulfillmentStatus },
        }
      );
    };

    // Recalculate old invoice group if customer/invoice changed
    const oldCustomer = existingDispatch.customer;
    const oldInvoice = existingDispatch.invoice;

    if (
      oldCustomer !== customer ||
      oldInvoice !== invoice
    ) {
      await syncFulfillmentStatus(
        oldCustomer,
        oldInvoice
      );
    }

    // Recalculate current invoice group
    await syncFulfillmentStatus(customer, invoice);

    // Fetch latest updated record
    const updatedDispatch = await Dispatch.findById(id)
      .populate("createdBy", "name email");

    const pendingQuantity =
      orderedQuantity - totalDispatchedQuantity;

    return res.status(200).json({
      success: true,
      message: "Dispatch updated successfully",
      dispatch: updatedDispatch,
      fulfillment: {
        orderedQuantity,
        dispatchedQuantity: totalDispatchedQuantity,
        pendingQuantity,
        fulfillmentStatus:
          totalDispatchedQuantity >= orderedQuantity
            ? "COMPLETE"
            : "PARTIAL",
      },
    });
  } catch (error) {
    console.error("Update dispatch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update dispatch",
      error: error.message,
    });
  }
};


// ======================================================
// UPDATE STATUS
// ======================================================

const updateDispatchStatus =
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "PENDING",
        "DISPATCHED",
        "DELIVERED",
        "CLOSED",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid dispatch status",
        });
      }

      const updateData = {
        status,
      };

      if (status === "CLOSED") {
        updateData.closedAt =
          new Date();
      }

      const dispatch =
        await Dispatch.findByIdAndUpdate(
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

      if (!dispatch) {
        return res.status(404).json({
          success: false,
          message:
            "Dispatch not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Dispatch status updated successfully",
        dispatch,
      });
    } catch (error) {
      console.error(
        "Update dispatch status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update dispatch status",
        error: error.message,
      });
    }
  };

// ======================================================
// DELETE DISPATCH
// ======================================================

const deleteDispatch = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const dispatch =
      await Dispatch.findByIdAndDelete(
        id
      );

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message:
          "Dispatch not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Dispatch deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete dispatch error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete dispatch",
      error: error.message,
    });
  }
};

// ======================================================
// DISPATCH STATS
// ======================================================

const getDispatchStats = async (
  req,
  res
) => {
  try {
    const [
      totalDispatches,
      pending,
      dispatched,
      delivered,
      closed,
    ] = await Promise.all([
      Dispatch.countDocuments(),

      Dispatch.countDocuments({
        status: "PENDING",
      }),

      Dispatch.countDocuments({
        status: "DISPATCHED",
      }),

      Dispatch.countDocuments({
        status: "DELIVERED",
      }),

      Dispatch.countDocuments({
        status: "CLOSED",
      }),
    ]);

    const quantityResult =
      await Dispatch.aggregate([
        {
          $group: {
            _id: null,
            totalQuantity: {
              $sum: "$quantity",
            },
          },
        },
      ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalDispatches,
        pending,
        dispatched,
        delivered,
        closed,
        totalQuantity:
          quantityResult[0]
            ?.totalQuantity || 0,
      },
    });
  } catch (error) {
    console.error(
      "Dispatch stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch dispatch statistics",
      error: error.message,
    });
  }
};

// ======================================================
// DISPATCH OVERVIEW
// ======================================================

const getDispatchOverview =
  async (req, res) => {
    try {
      const [
        statusData,
        trendData,
        transporterData,
        recentDispatches,
      ] = await Promise.all([
        Dispatch.aggregate([
          {
            $group: {
              _id: "$status",
              count: {
                $sum: 1,
              },
              quantity: {
                $sum: "$quantity",
              },
            },
          },
          {
            $sort: {
              count: -1,
            },
          },
        ]),

        Dispatch.aggregate([
          {
            $group: {
              _id: {
                year: {
                  $year:
                    "$dispatchDate",
                },
                month: {
                  $month:
                    "$dispatchDate",
                },
              },
              count: {
                $sum: 1,
              },
              quantity: {
                $sum: "$quantity",
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

        Dispatch.aggregate([
          {
            $match: {
              transporter: {
                $nin: [
                  null,
                  "",
                ],
              },
            },
          },
          {
            $group: {
              _id: "$transporter",
              dispatchCount: {
                $sum: 1,
              },
              quantity: {
                $sum: "$quantity",
              },
            },
          },
          {
            $sort: {
              quantity: -1,
            },
          },
          {
            $limit: 5,
          },
        ]),

        Dispatch.find()
          .populate(
            "createdBy",
            "name email"
          )
          .sort({
            dispatchDate: -1,
            createdAt: -1,
          })
          .limit(10),
      ]);

      return res.status(200).json({
        success: true,
        overview: {
          statusData,
          trendData,
          transporterData,
          recentDispatches,
        },
      });
    } catch (error) {
      console.error(
        "Dispatch overview error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch dispatch overview",
        error: error.message,
      });
    }
  };

// ======================================================
// DISPATCH SUMMARY
// ======================================================

const getDispatchSummary = async (
  req,
  res
) => {
  try {
    const [
      totalDispatches,
      pending,
      dispatched,
      delivered,
      closed,
      totalQuantity,
    ] = await Promise.all([
      Dispatch.countDocuments(),

      Dispatch.countDocuments({
        status: "PENDING",
      }),

      Dispatch.countDocuments({
        status: "DISPATCHED",
      }),

      Dispatch.countDocuments({
        status: "DELIVERED",
      }),

      Dispatch.countDocuments({
        status: "CLOSED",
      }),

      Dispatch.aggregate([
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

    return res.status(200).json({
      success: true,
      summary: {
        totalDispatches,
        pending,
        dispatched,
        delivered,
        closed,
        totalQuantity:
          totalQuantity[0]?.total ||
          0,
      },
    });
  } catch (error) {
    console.error(
      "Dispatch summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch dispatch summary",
      error: error.message,
    });
  }
};

// ======================================================
// DISPATCH ALERTS
// ======================================================

const getDispatchAlerts = async (
  req,
  res
) => {
  try {
    const pendingDispatches =
      await Dispatch.find({
        status: "PENDING",
      })
        .sort({
          dispatchDate: 1,
        })
        .limit(10);

    const deliveredWithoutPOD =
      await Dispatch.find({
        status: "DELIVERED",
        $or: [
          {
            pod: "",
          },
          {
            pod: null,
          },
        ],
      })
        .sort({
          dispatchDate: -1,
        })
        .limit(10);

    return res.status(200).json({
      success: true,
      alerts: {
        pendingDispatches,
        deliveredWithoutPOD,
      },
    });
  } catch (error) {
    console.error(
      "Dispatch alerts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch dispatch alerts",
      error: error.message,
    });
  }
};

// ======================================================
// MONTHLY STATS
// ======================================================

const getMonthlyDispatchStats =
  async (req, res) => {
    try {
      const year =
        Number(req.query.year) ||
        new Date().getFullYear();

      const monthlyStats =
        await Dispatch.aggregate([
          {
            $match: {
              dispatchDate: {
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
                    "$dispatchDate",
                },
                status:
                  "$status",
              },

              count: {
                $sum: 1,
              },

              quantity: {
                $sum: "$quantity",
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
        "Monthly dispatch stats error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch monthly dispatch statistics",
        error: error.message,
      });
    }
  };

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createDispatch,
  getDispatches,
  getDispatchById,
  updateDispatch,
  updateDispatchStatus,
  deleteDispatch,
  getDispatchStats,
  getDispatchOverview,
  getDispatchSummary,
  getDispatchAlerts,
  getMonthlyDispatchStats,
};