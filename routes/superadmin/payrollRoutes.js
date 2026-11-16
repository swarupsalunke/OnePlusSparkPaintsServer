
const express = require("express");
const router = express.Router();

const {
  getEmployeeSalary,
  saveEmployeeSalary,
  processPayroll,
  getPayrollRecords,
  updatePayrollStatus,
} = require("../../controllers/superadmin/payrollController");

// Employee salary
router.get("/salary/:employeeId", getEmployeeSalary);
router.put("/salary/:employeeId", saveEmployeeSalary);

// Monthly payroll
router.post("/process", processPayroll);
router.get("/", getPayrollRecords);
router.put("/status/:payrollId", updatePayrollStatus);
router.patch("/:payrollId/status", updatePayrollStatus);

module.exports = router;
