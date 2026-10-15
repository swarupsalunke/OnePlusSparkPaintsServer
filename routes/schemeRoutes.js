const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const {
  createScheme,
  getAllSchemes,
  getSchemeById,
  updateScheme,
  deleteScheme,
} = require("../controllers/schemeController");

const router = express.Router();


// Upload directory
const uploadDir = path.join(
  __dirname,
  "../uploads/schemes"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}


// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;

    cb(null, uniqueName);
  },
});


const upload = multer({
  storage,
});


// Create Scheme
router.post(
  "/",
  upload.fields([
    {
      name: "banner",
      maxCount: 1,
    },
    {
      name: "pdf",
      maxCount: 1,
    },
  ]),
  createScheme
);


// Get All Schemes
router.get("/", getAllSchemes);


// Get Single Scheme
router.get("/:id", getSchemeById);


// Update Scheme
router.put(
  "/:id",
  upload.fields([
    {
      name: "banner",
      maxCount: 1,
    },
    {
      name: "pdf",
      maxCount: 1,
    },
  ]),
  updateScheme
);


// Delete Scheme
router.delete("/:id", deleteScheme);


module.exports = router;