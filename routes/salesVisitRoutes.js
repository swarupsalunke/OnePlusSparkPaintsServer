const express = require("express");

const {
  getSalesVisitDashboard,

  getVisits,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit,

  updateVisitStatus,
  updateGPSLocation,

  createBeat,
  getBeats,
  updateBeat,
  deleteBeat,

  createTerritory,
  getTerritories,
  updateTerritory,
  deleteTerritory,

  createRoute,
  getRoutes,
  updateRoute,
  deleteRoute,

  getVisitHistory,
} = require("../controllers/salesVisitController");

const router = express.Router();


// =====================================================
// DASHBOARD
// =====================================================

router.get(
  "/dashboard",
  getSalesVisitDashboard
);


// =====================================================
// VISIT HISTORY
// =====================================================

router.get(
  "/history",
  getVisitHistory
);


// =====================================================
// BEAT ROUTES
// =====================================================

router.post(
  "/beats",
  createBeat
);

router.get(
  "/beats",
  getBeats
);

router.put(
  "/beats/:id",
  updateBeat
);

router.delete(
  "/beats/:id",
  deleteBeat
);


// =====================================================
// TERRITORY ROUTES
// =====================================================

router.post(
  "/territories",
  createTerritory
);

router.get(
  "/territories",
  getTerritories
);

router.put(
  "/territories/:id",
  updateTerritory
);

router.delete(
  "/territories/:id",
  deleteTerritory
);


// =====================================================
// ROUTE PLANNING ROUTES
// =====================================================

router.post(
  "/routes",
  createRoute
);

router.get(
  "/routes",
  getRoutes
);

router.put(
  "/routes/:id",
  updateRoute
);

router.delete(
  "/routes/:id",
  deleteRoute
);


// =====================================================
// VISIT MAIN ROUTES
// =====================================================

router.get(
  "/",
  getVisits
);

router.post(
  "/",
  createVisit
);


// =====================================================
// VISIT ID ROUTES
// ALWAYS KEEP THESE LAST
// =====================================================

router.get(
  "/:id",
  getVisitById
);

router.put(
  "/:id",
  updateVisit
);

router.delete(
  "/:id",
  deleteVisit
);

router.patch(
  "/:id/status",
  updateVisitStatus
);

router.patch(
  "/:id/gps",
  updateGPSLocation
);


module.exports = router;