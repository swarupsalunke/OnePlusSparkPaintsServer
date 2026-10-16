const Beat = require("../models/Beat");
const Territory = require("../models/Territory");
const Route = require("../models/Route");
const Visit = require("../models/Visit");

// =====================================================
// DASHBOARD / STATS
// =====================================================
exports.getSalesVisitDashboard = async (req, res) => {
  try {
    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const [
      totalVisits,
      plannedVisits,
      inProgressVisits,
      completedVisits,
      cancelledVisits,
      todayVisits,
      activeBeats,
      activeTerritories,
      activeRoutes,
    ] = await Promise.all([
      Visit.countDocuments(),

      Visit.countDocuments({
        visitStatus: "PLANNED",
      }),

      Visit.countDocuments({
        visitStatus: "IN_PROGRESS",
      }),

      Visit.countDocuments({
        visitStatus: "COMPLETED",
      }),

      Visit.countDocuments({
        visitStatus: "CANCELLED",
      }),

      Visit.countDocuments({
        visitDate: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      }),

      Beat.countDocuments({
        status: "ACTIVE",
      }),

      Territory.countDocuments({
        status: "ACTIVE",
      }),

      Route.countDocuments({
        status: "ACTIVE",
      }),
    ]);

    res.status(200).json({
      success: true,
      dashboard: {
        totalVisits,
        plannedVisits,
        inProgressVisits,
        completedVisits,
        cancelledVisits,
        todayVisits,
        activeBeats,
        activeTerritories,
        activeRoutes,
      },
    });
  } catch (error) {
    console.error(
      "Get sales visit dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch sales visit dashboard",
      error: error.message,
    });
  }
};


// =====================================================
// GET ALL VISITS
// =====================================================
exports.getVisits = async (req, res) => {
  try {
    const {
      visitType,
      visitStatus,
      assignedTo,
      territory,
      beat,
      route,
    } = req.query;

    const filter = {};

    if (visitType) {
      filter.visitType = visitType;
    }

    if (visitStatus) {
      filter.visitStatus = visitStatus;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (territory) {
      filter.territory = territory;
    }

    if (beat) {
      filter.beat = beat;
    }

    if (route) {
      filter.route = route;
    }

    const visits = await Visit.find(filter)
      .sort({ visitDate: 1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error) {
    console.error(
      "Get visits error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch visits",
      error: error.message,
    });
  }
};


// =====================================================
// GET SINGLE VISIT
// =====================================================
exports.getVisitById = async (req, res) => {
  try {
    const visit = await Visit.findById(
      req.params.id
    );

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    res.status(200).json({
      success: true,
      visit,
    });
  } catch (error) {
    console.error(
      "Get visit by ID error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch visit",
      error: error.message,
    });
  }
};


// =====================================================
// CREATE VISIT
// =====================================================
exports.createVisit = async (req, res) => {
  try {
    const {
      visitType,
      customerName,
      customerId,
      customerMobile,
      territory,
      beat,
      route,
      visitDate,
      visitTime,
      assignedTo,
      location,
      visitStatus,
      remarks,
    } = req.body;

    const visit = await Visit.create({
      visitType,
      customerName,
      customerId,
      customerMobile,
      territory,
      beat,
      route,
      visitDate,
      visitTime,
      assignedTo,
      location,
      visitStatus,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: "Visit created successfully",
      visit,
    });
  } catch (error) {
    console.error(
      "Create visit error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create visit",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE VISIT
// =====================================================
exports.updateVisit = async (req, res) => {
  try {
    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Visit updated successfully",
      visit,
    });
  } catch (error) {
    console.error(
      "Update visit error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update visit",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE VISIT
// =====================================================
exports.deleteVisit = async (req, res) => {
  try {
    const visit = await Visit.findByIdAndDelete(
      req.params.id
    );

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Visit deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete visit error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete visit",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE VISIT STATUS
// =====================================================
exports.updateVisitStatus = async (req, res) => {
  try {
    const { visitStatus } = req.body;

    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      {
        visitStatus,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Visit status updated successfully",
      visit,
    });
  } catch (error) {
    console.error(
      "Update visit status error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update visit status",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE GPS LOCATION
// =====================================================
exports.updateGPSLocation = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
    } = req.body;

    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      {
        "location.latitude": latitude,
        "location.longitude": longitude,

        "gpsTracking.enabled": true,
        "gpsTracking.lastLatitude": latitude,
        "gpsTracking.lastLongitude": longitude,
        "gpsTracking.lastTrackedAt": new Date(),
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "GPS location updated successfully",
      visit,
    });
  } catch (error) {
    console.error(
      "Update GPS location error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update GPS location",
      error: error.message,
    });
  }
};


// =====================================================
// CREATE BEAT
// =====================================================
exports.createBeat = async (req, res) => {
  try {
    const beat = await Beat.create(req.body);

    res.status(201).json({
      success: true,
      message: "Beat created successfully",
      beat,
    });
  } catch (error) {
    console.error(
      "Create beat error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create beat",
      error: error.message,
    });
  }
};


// =====================================================
// GET BEATS
// =====================================================
exports.getBeats = async (req, res) => {
  try {
    const beats = await Beat.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: beats.length,
      beats,
    });
  } catch (error) {
    console.error(
      "Get beats error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch beats",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE BEAT
// =====================================================
exports.updateBeat = async (req, res) => {
  try {
    const beat = await Beat.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!beat) {
      return res.status(404).json({
        success: false,
        message: "Beat not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Beat updated successfully",
      beat,
    });
  } catch (error) {
    console.error(
      "Update beat error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update beat",
      error: error.message,
    });
  }
};


// =====================================================
// CREATE TERRITORY
// =====================================================
exports.createTerritory = async (req, res) => {
  try {
    const territory =
      await Territory.create(req.body);

    res.status(201).json({
      success: true,
      message: "Territory created successfully",
      territory,
    });
  } catch (error) {
    console.error(
      "Create territory error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create territory",
      error: error.message,
    });
  }
};


// =====================================================
// GET TERRITORIES
// =====================================================
exports.getTerritories = async (req, res) => {
  try {
    const territories =
      await Territory.find()
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: territories.length,
      territories,
    });
  } catch (error) {
    console.error(
      "Get territories error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch territories",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE TERRITORY
// =====================================================
exports.updateTerritory = async (req, res) => {
  try {
    const territory =
      await Territory.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!territory) {
      return res.status(404).json({
        success: false,
        message: "Territory not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Territory updated successfully",
      territory,
    });
  } catch (error) {
    console.error(
      "Update territory error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update territory",
      error: error.message,
    });
  }
};


// =====================================================
// CREATE ROUTE
// =====================================================
exports.createRoute = async (req, res) => {
  try {
    const route =
      await Route.create(req.body);

    res.status(201).json({
      success: true,
      message: "Route created successfully",
      route,
    });
  } catch (error) {
    console.error(
      "Create route error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create route",
      error: error.message,
    });
  }
};


// =====================================================
// GET ROUTES
// =====================================================
exports.getRoutes = async (req, res) => {
  try {
    const routes =
      await Route.find()
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: routes.length,
      routes,
    });
  } catch (error) {
    console.error(
      "Get routes error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch routes",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE ROUTE
// =====================================================
exports.updateRoute = async (req, res) => {
  try {
    const route =
      await Route.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Route updated successfully",
      route,
    });
  } catch (error) {
    console.error(
      "Update route error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update route",
      error: error.message,
    });
  }
};


// =====================================================
// GET VISIT HISTORY
// =====================================================
exports.getVisitHistory = async (req, res) => {
  try {
    const visits = await Visit.find({
      visitStatus: "COMPLETED",
    }).sort({
      visitDate: -1,
    });

    res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error) {
    console.error(
      "Get visit history error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch visit history",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE BEAT
// =====================================================
exports.deleteBeat = async (req, res) => {
  try {
    const beat = await Beat.findByIdAndDelete(req.params.id);

    if (!beat) {
      return res.status(404).json({
        success: false,
        message: "Beat not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Beat deleted successfully",
    });
  } catch (error) {
    console.error("Delete beat error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete beat",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE TERRITORY
// =====================================================
exports.deleteTerritory = async (req, res) => {
  try {
    const territory = await Territory.findByIdAndDelete(
      req.params.id
    );

    if (!territory) {
      return res.status(404).json({
        success: false,
        message: "Territory not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Territory deleted successfully",
    });
  } catch (error) {
    console.error("Delete territory error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete territory",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE ROUTE
// =====================================================
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(
      req.params.id
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Route deleted successfully",
    });
  } catch (error) {
    console.error("Delete route error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete route",
      error: error.message,
    });
  }
};