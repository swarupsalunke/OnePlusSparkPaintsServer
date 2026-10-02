const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/complaints");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const imageTypes = [".jpg", ".jpeg", ".png", ".webp"];
  const documentTypes = [".pdf", ".xls", ".xlsx", ".doc", ".docx"];

  const extension = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "images" && imageTypes.includes(extension)) {
    return cb(null, true);
  }

  if (file.fieldname === "documents" && documentTypes.includes(extension)) {
    return cb(null, true);
  }

  cb(new Error(`Invalid file type for ${file.fieldname}`));
};

const dealerComplaintUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = dealerComplaintUpload;