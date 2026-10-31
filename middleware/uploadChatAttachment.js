const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "oneplussparkpaints/chat-attachments",
    resource_type: "auto",
    allowed_formats: [
      "jpg", "jpeg", "png", "webp",
      "pdf", "doc", "docx",
      "xls", "xlsx", "txt",
    ],
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error("File type is not supported"), false);
  }
};

const uploadChatAttachment = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
});

module.exports = uploadChatAttachment;