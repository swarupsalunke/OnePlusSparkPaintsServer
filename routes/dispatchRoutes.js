const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
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
} = require("../controllers/dispatchController");

const router = express.Router();


// ======================================================
// DISPATCH UPLOAD DIRECTORY
// ======================================================

const uploadDir = path.join(
  __dirname,
  "../uploads/dispatch"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}


// ======================================================
// MULTER STORAGE
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${file.originalname.replace(
        /\s+/g,
        "-"
      )}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
});


// ======================================================
// DASHBOARD
// ======================================================

router.get(
  "/stats",
  authMiddleware,
  getDispatchStats
);

router.get(
  "/overview",
  authMiddleware,
  getDispatchOverview
);

router.get(
  "/summary",
  authMiddleware,
  getDispatchSummary
);

router.get(
  "/alerts",
  authMiddleware,
  getDispatchAlerts
);

router.get(
  "/monthly-stats",
  authMiddleware,
  getMonthlyDispatchStats
);


// ======================================================
// CREATE DISPATCH
// ======================================================

router.post(
  "/",
  authMiddleware,
  upload.fields([
    {
      name: "pod",
      maxCount: 1,
    },
    {
      name: "vehiclePhotos",
      maxCount: 5,
    },
    {
      name: "invoiceUpload",
      maxCount: 1,
    },
    {
      name: "deliveryChallan",
      maxCount: 1,
    },
    {
      name: "acknowledgement",
      maxCount: 1,
    },
  ]),
  createDispatch
);


// ======================================================
// GET ALL
// ======================================================

router.get(
  "/",
  authMiddleware,
  getDispatches
);


// ======================================================
// GET SINGLE
// ======================================================

router.get(
  "/:id",
  authMiddleware,
  getDispatchById
);


// ======================================================
// UPDATE
// ======================================================

router.put(
  "/:id",
  authMiddleware,
  upload.fields([
    {
      name: "pod",
      maxCount: 1,
    },
    {
      name: "vehiclePhotos",
      maxCount: 5,
    },
    {
      name: "invoiceUpload",
      maxCount: 1,
    },
    {
      name: "deliveryChallan",
      maxCount: 1,
    },
    {
      name: "acknowledgement",
      maxCount: 1,
    },
  ]),
  updateDispatch
);


// ======================================================
// STATUS
// ======================================================

router.patch(
  "/:id/status",
  authMiddleware,
  updateDispatchStatus
);


// ======================================================
// DELETE
// ======================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteDispatch
);


module.exports = router;