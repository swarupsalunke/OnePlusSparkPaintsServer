
const express = require("express");
const router = express.Router();

const {
  getEmployeeSalary,
  saveEmployeeSalary,
  processPayroll,
  getPayrollRecords,
} = require("../../controllers/superadmin/payrollController");

// Employee salary
router.get("/salary/:employeeId", getEmployeeSalary);
router.put("/salary/:employeeId", saveEmployeeSalary);

// Monthly payroll
router.post("/process", processPayroll);
router.get("/", getPayrollRecords);

module.exports = router;
