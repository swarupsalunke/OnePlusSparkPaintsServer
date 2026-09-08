const Dispatch = require("../models/Dispatch");

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

    if (
      !customer ||
      !invoice ||
      quantity === undefined ||
      !unit
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide customer, invoice, quantity and unit",
      });
    }

    const numericQuantity =
      Number(quantity);

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be greater than 0",
      });
    }

    const uploadedFiles =
      getUploadedFiles(req);

    const dispatchNumber =
      await generateDispatchNumber();

    const dispatch =
      await Dispatch.create({
        dispatchNumber,

        dispatchDate:
          dispatchDate || new Date(),

        customer,
        invoice,

        route:
          route || "",

        destination:
          destination || "",

        quantity:
          numericQuantity,

        unit,

        driver:
          driver || "",

        vehicle:
          vehicle || "",

        transportMode:
          transportMode || "",

        transporter:
          transporter || "",

        dispatchTeam:
          Array.isArray(dispatchTeam)
            ? dispatchTeam
            : dispatchTeam
              ? [dispatchTeam]
              : [],

        // Uploaded files
        pod:
          uploadedFiles.pod,

        vehiclePhotos:
          uploadedFiles.vehiclePhotos,

        invoiceUpload:
          uploadedFiles.invoiceUpload,

        deliveryChallan:
          uploadedFiles.deliveryChallan,

        acknowledgement:
          uploadedFiles.acknowledgement,

        status:
          status || "PENDING",

        remarks:
          remarks || "",

        createdBy:
          req.user?.userId || null,
      });

    const populatedDispatch =
      await Dispatch.findById(
        dispatch._id
      ).populate(
        "createdBy",
        "name email"
      );

    return res.status(201).json({
      success: true,
      message:
        "Dispatch created successfully",
      dispatch:
        populatedDispatch,
    });
  } catch (error) {
    console.error(
      "Create dispatch error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create dispatch",
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

const updateDispatch = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
    };

    const uploadedFiles =
      getUploadedFiles(req);

    // Update uploaded files only
    // when a new file is provided.

    if (uploadedFiles.pod) {
      updateData.pod =
        uploadedFiles.pod;
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

    if (
      uploadedFiles.vehiclePhotos
        .length > 0
    ) {
      updateData.vehiclePhotos =
        uploadedFiles.vehiclePhotos;
    }

    // Convert dispatchTeam
    // when sent through form-data.

    if (
      typeof updateData.dispatchTeam ===
      "string"
    ) {
      try {
        const parsed =
          JSON.parse(
            updateData.dispatchTeam
          );

        updateData.dispatchTeam =
          Array.isArray(parsed)
            ? parsed
            : [updateData.dispatchTeam];
      } catch {
        updateData.dispatchTeam = [
          updateData.dispatchTeam,
        ];
      }
    }

    // Convert numeric quantity
    // when sent through form-data.

    if (
      updateData.quantity !==
      undefined &&
      updateData.quantity !== ""
    ) {
      updateData.quantity = Number(
        updateData.quantity
      );

      if (
        !Number.isFinite(
          updateData.quantity
        ) ||
        updateData.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Quantity must be greater than 0",
        });
      }
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
        "Dispatch updated successfully",
      dispatch,
    });
  } catch (error) {
    console.error(
      "Update dispatch error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update dispatch",
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