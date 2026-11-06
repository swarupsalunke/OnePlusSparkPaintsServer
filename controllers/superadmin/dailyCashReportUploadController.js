const cloudinary = require("../../config/cloudinary");

const uploadDailyCashReportFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file to upload",
      });
    }

    const allowedCategories = [
      "expense-bill",
      "purchase-bill",
      "supporting-document",
    ];

    const category = String(req.body.category || "").toLowerCase();

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document category",
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `daily-cash-reports/${category}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      file: {
        fileName: req.file.originalname,
        fileUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        size: uploadResult.bytes,
      },
    });
  } catch (error) {
    console.error("Daily cash report file upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

module.exports = {
  uploadDailyCashReportFile,
};