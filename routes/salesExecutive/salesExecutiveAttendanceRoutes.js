const express = require("express");
const router = express.Router();

const {
  checkIn,
  checkOut,
  updateLiveLocation,
  getAttendanceHistory,
  getTodayAttendance,
} = require("../../controllers/salesExecutive/salesExecutiveAttendanceController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const salesExecutiveAttendanceUpload = require("../../middleware/salesExecutiveAttendanceUpload");

router.post(
  "/check-in",
  authMiddleware,
  roleMiddleware("SALES_EXECUTIVE"),
  salesExecutiveAttendanceUpload.single("selfie"),
  checkIn
);

router.post(
  "/check-out",
  authMiddleware,
  roleMiddleware("SALES_EXECUTIVE"),
  checkOut
);

router.put(
  "/live-location",
  authMiddleware,
  roleMiddleware("SALES_EXECUTIVE"),
  updateLiveLocation
);

router.get(
  "/history",
  authMiddleware,
  roleMiddleware("SALES_EXECUTIVE"),
  getAttendanceHistory
);

router.get(
  "/today",
  authMiddleware,
  roleMiddleware("SALES_EXECUTIVE"),
  getTodayAttendance
);

module.exports = router;