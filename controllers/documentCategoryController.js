const DocumentCategory = require("../models/documentCategoryModel");

// =====================================================
// CREATE CATEGORY
// =====================================================
exports.createCategory = async (req, res) => {
  try {
    const {
      categoryName,
      description,
      status,
    } = req.body;

    const category = await DocumentCategory.create({
      categoryName,
      description: description || "",
      status: status || "ACTIVE",
    });

    res.status(201).json({
      success: true,
      message: "Document category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create document category",
      error: error.message,
    });
  }
};


// =====================================================
// GET ALL CATEGORIES
// =====================================================
exports.getCategories = async (req, res) => {
  try {
    const categories = await DocumentCategory.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch document categories",
      error: error.message,
    });
  }
};


// =====================================================
// GET SINGLE CATEGORY
// =====================================================
exports.getCategoryById = async (req, res) => {
  try {
    const category =
      await DocumentCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Document category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch document category",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE CATEGORY
// =====================================================
exports.updateCategory = async (req, res) => {
  try {
    const {
      categoryName,
      description,
      status,
    } = req.body;

    const category =
      await DocumentCategory.findByIdAndUpdate(
        req.params.id,
        {
          categoryName,
          description:
            description !== undefined
              ? description
              : "",
          status:
            status !== undefined
              ? status
              : "ACTIVE",
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Document category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Document category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update document category",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE CATEGORY
// =====================================================
exports.deleteCategory = async (req, res) => {
  try {
    const category =
      await DocumentCategory.findByIdAndDelete(
        req.params.id
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Document category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Document category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete document category",
      error: error.message,
    });
  }
};