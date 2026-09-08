const express = require("express");

const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/documentCategoryController");

// Create category
router.post("/", createCategory);

// Get all categories
router.get("/", getCategories);

// Get single category
router.get("/:id", getCategoryById);

// Update category
router.put("/:id", updateCategory);

// Delete category
router.delete("/:id", deleteCategory);

module.exports = router;