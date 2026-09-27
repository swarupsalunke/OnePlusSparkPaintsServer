const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const {
  editPainterProfile,
} = require("../../controllers/painter/painterEditProfileController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// Upload directory
const uploadDir = path.join(
  __dirname,
  "../../uploads/painter"
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

// Multer upload
const upload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.put(
  "/",
  authMiddleware,
  roleMiddleware("PAINTER"),
  upload.single("profileImage"),
  editPainterProfile
);

module.exports = router;