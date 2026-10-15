const express = require("express");

const {
  createAdvanceSalary,
  getAllAdvanceSalary,
  getAdvanceSalaryById,
  updateAdvanceSalary,
  updateAdvanceSalaryApproval,
  deleteAdvanceSalary,
} = require("../controllers/advanceSalaryController");

const router = express.Router();

// Create Advance Salary Request
router.post("/", createAdvanceSalary);

// Get All Advance Salary Requests
router.get("/", getAllAdvanceSalary);

// Get Single Advance Salary Request
router.get("/:id", getAdvanceSalaryById);

// Update Advance Salary Request
router.put("/:id", updateAdvanceSalary);

// Approve / Reject Advance Salary Request
router.put("/:id/approval", updateAdvanceSalaryApproval);

// Delete Advance Salary Request
router.delete("/:id", deleteAdvanceSalary);

module.exports = router;