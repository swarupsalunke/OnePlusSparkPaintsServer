const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  publishDocument,
  disableDocument,
  deleteDocument,
  downloadDocument,
} = require("../controllers/documentController");

// =====================================================
// CREATE / UPLOAD DOCUMENT
// =====================================================
router.post(
  "/",
  upload.single("document"),
  createDocument
);

// =====================================================
// GET ALL DOCUMENTS
// =====================================================
router.get("/", getDocuments);

// =====================================================
// GET SINGLE DOCUMENT
// =====================================================
router.get("/:id", getDocumentById);

// =====================================================
// UPDATE DOCUMENT
// =====================================================
// File optional hai.
// File nahi bheji to existing file rahegi.
router.put(
  "/:id",
  upload.single("document"),
  updateDocument
);

// =====================================================
// PUBLISH DOCUMENT
// =====================================================
router.put("/:id/publish", publishDocument);

// =====================================================
// DISABLE DOCUMENT
// =====================================================
router.put("/:id/disable", disableDocument);

// =====================================================
// DELETE DOCUMENT
// =====================================================
router.delete("/:id", deleteDocument);

// =====================================================
// DOWNLOAD DOCUMENT
// =====================================================
router.get("/:id/download", downloadDocument);

module.exports = router;