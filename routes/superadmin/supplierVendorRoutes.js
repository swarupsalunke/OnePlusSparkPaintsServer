const express = require("express");
const router = express.Router();

const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require("../../controllers/superadmin/supplierVendorController");

const authMiddleware = require("../../middleware/authMiddleware");

// CREATE
router.post("/", authMiddleware, createSupplier);

// GET ALL
router.get("/", authMiddleware, getAllSuppliers);

// GET SINGLE
router.get("/:id", authMiddleware, getSupplierById);

// UPDATE
router.put("/:id", authMiddleware, updateSupplier);

// DELETE
router.delete("/:id", authMiddleware, deleteSupplier);

module.exports = router;