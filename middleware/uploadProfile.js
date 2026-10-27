
const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// =====================================================
// CLOUDINARY STORAGE
// =====================================================

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "oneplussparkpaints/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed"
      ),
      false
    );
  }
};

// =====================================================
// MULTER
// =====================================================

const uploadProfile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// =====================================================
// EXPORT
// =====================================================

module.exports = uploadProfile;
