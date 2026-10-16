const Document = require("../models/documentModel");
const path = require("path");

// =====================================================
// CREATE / UPLOAD DOCUMENT
// =====================================================
exports.createDocument = async (req, res) => {
  try {
    const {
      documentName,
      category,
      customCategory,
      accessTo,
      status,
      description,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    let parsedAccessTo = accessTo;

    if (typeof accessTo === "string") {
      try {
        parsedAccessTo = JSON.parse(accessTo);
      } catch {
        parsedAccessTo = accessTo
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    if (!Array.isArray(parsedAccessTo) || parsedAccessTo.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one access type is required",
      });
    }

    const extension = path
      .extname(req.file.originalname)
      .toLowerCase();

    let fileType = "OTHER";

    if (extension === ".pdf") {
      fileType = "PDF";
    } else if (
      [".jpg", ".jpeg", ".png"].includes(extension)
    ) {
      fileType = "IMAGE";
    } else if (
      [".doc", ".docx"].includes(extension)
    ) {
      fileType = "DOCUMENT";
    }

    const documentStatus = status || "DRAFT";

    const document = await Document.create({
      documentName,
      category,
      customCategory: customCategory || "",

      fileName: req.file.filename,

      fileUrl: `/uploads/documents/${req.file.filename}`,

      fileType,

      fileSize: req.file.size,

      accessTo: parsedAccessTo,

      status: documentStatus,

      description: description || "",

      publishedAt:
        documentStatus === "PUBLISHED"
          ? new Date()
          : null,
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Create document error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to upload document",
      error: error.message,
    });
  }
};


// =====================================================
// GET ALL DOCUMENTS
// =====================================================
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};


// =====================================================
// GET SINGLE DOCUMENT
// =====================================================
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Get document error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch document",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE DOCUMENT
// =====================================================
exports.updateDocument = async (req, res) => {
  try {
    const existingDocument =
      await Document.findById(req.params.id);

    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const {
      documentName,
      category,
      customCategory,
      accessTo,
      status,
      description,
    } = req.body;

    let parsedAccessTo = accessTo;

    if (typeof accessTo === "string") {
      try {
        parsedAccessTo = JSON.parse(accessTo);
      } catch {
        parsedAccessTo = accessTo
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    const updateData = {
      documentName:
        documentName !== undefined
          ? documentName
          : existingDocument.documentName,

      category:
        category !== undefined
          ? category
          : existingDocument.category,

      customCategory:
        customCategory !== undefined
          ? customCategory
          : existingDocument.customCategory,

      accessTo:
        parsedAccessTo !== undefined
          ? parsedAccessTo
          : existingDocument.accessTo,

      status:
        status !== undefined
          ? status
          : existingDocument.status,

      description:
        description !== undefined
          ? description
          : existingDocument.description,
    };

    // New file uploaded during edit
    if (req.file) {
      const extension = path
        .extname(req.file.originalname)
        .toLowerCase();

      let fileType = "OTHER";

      if (extension === ".pdf") {
        fileType = "PDF";
      } else if (
        [".jpg", ".jpeg", ".png"].includes(extension)
      ) {
        fileType = "IMAGE";
      } else if (
        [".doc", ".docx"].includes(extension)
      ) {
        fileType = "DOCUMENT";
      }

      updateData.fileName = req.file.filename;
      updateData.fileUrl =
        `/uploads/documents/${req.file.filename}`;
      updateData.fileType = fileType;
      updateData.fileSize = req.file.size;
    }

    if (status === "PUBLISHED") {
      updateData.publishedAt = new Date();
    }

    if (status === "DISABLED") {
      updateData.publishedAt = null;
    }

    const document =
      await Document.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    res.status(200).json({
      success: true,
      message: "Document updated successfully",
      document,
    });
  } catch (error) {
    console.error("Update document error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update document",
      error: error.message,
    });
  }
};


// =====================================================
// PUBLISH DOCUMENT
// =====================================================
exports.publishDocument = async (req, res) => {
  try {
    const document =
      await Document.findByIdAndUpdate(
        req.params.id,
        {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Document published successfully",
      document,
    });
  } catch (error) {
    console.error("Publish document error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to publish document",
      error: error.message,
    });
  }
};


// =====================================================
// DISABLE DOCUMENT
// =====================================================
exports.disableDocument = async (req, res) => {
  try {
    const document =
      await Document.findByIdAndUpdate(
        req.params.id,
        {
          status: "DISABLED",
          publishedAt: null,
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Document disabled successfully",
      document,
    });
  } catch (error) {
    console.error("Disable document error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to disable document",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE DOCUMENT
// =====================================================
exports.deleteDocument = async (req, res) => {
  try {
    const document =
      await Document.findByIdAndDelete(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message,
    });
  }
};


// =====================================================
// DOWNLOAD DOCUMENT
// =====================================================
exports.downloadDocument = async (req, res) => {
  try {
    const document =
      await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (document.status !== "PUBLISHED") {
      return res.status(403).json({
        success: false,
        message: "This document is not available for download",
      });
    }

    await Document.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          downloadCount: 1,
        },
      }
    );

    const filePath = path.join(
      __dirname,
      "..",
      document.fileUrl
    );

    res.download(
      filePath,
      document.fileName,
      (error) => {
        if (error) {
          console.error(
            "File download error:",
            error
          );

          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: "Failed to download document",
              error: error.message,
            });
          }
        }
      }
    );
  } catch (error) {
    console.error("Download document error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to download document",
      error: error.message,
    });
  }
};