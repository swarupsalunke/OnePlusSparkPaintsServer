
const Employee = require("../../models/superadmin/employeeModel");
const EmployeeSalary = require("../../models/superadmin/employeeSalaryModel");
const Payroll = require("../../models/superadmin/payrollModel");

// GET EMPLOYEE SALARY
exports.getEmployeeSalary = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const salary = await EmployeeSalary.findOne({
      employee: employeeId,
    }).populate("employee", "employeeId name department designation");

    return res.status(200).json({
      success: true,
      salary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADD / UPDATE EMPLOYEE SALARY
exports.saveEmployeeSalary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { basicSalary, allowances = 0, deductions = 0 } = req.body;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const basic = Number(basicSalary);
    const allowance = Number(allowances);
    const deduction = Number(deductions);

    if (
      !Number.isFinite(basic) ||
      !Number.isFinite(allowance) ||
      !Number.isFinite(deduction) ||
      basic < 0 ||
      allowance < 0 ||
      deduction < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter valid non-negative salary amounts",
      });
    }

    const netSalary = basic + allowance - deduction;

    if (netSalary < 0) {
      return res.status(400).json({
        success: false,
        message: "Deductions cannot exceed gross salary",
      });
    }

    const salary = await EmployeeSalary.findOneAndUpdate(
      { employee: employeeId },
      {
        employee: employeeId,
        basicSalary: basic,
        allowances: allowance,
        deductions: deduction,
        netSalary,
      },
      { new: true, upsert: true, runValidators: true }
    ).populate("employee", "employeeId name");

    return res.status(200).json({
      success: true,
      message: "Employee salary saved successfully",
      salary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PROCESS MONTHLY PAYROLL
exports.processPayroll = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      year,
      basicSalary,
      allowances = 0,
      deductions = 0,
    } = req.body;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const payrollMonth = Number(month);
    const payrollYear = Number(year);
    const basic = Number(basicSalary);
    const allowance = Number(allowances);
    const deduction = Number(deductions);

    if (
      !Number.isInteger(payrollMonth) ||
      payrollMonth < 1 ||
      payrollMonth > 12 ||
      !Number.isInteger(payrollYear) ||
      payrollYear < 2000 ||
      !Number.isFinite(basic) ||
      !Number.isFinite(allowance) ||
      !Number.isFinite(deduction) ||
      basic < 0 ||
      allowance < 0 ||
      deduction < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid payroll details",
      });
    }

    const netSalary = basic + allowance - deduction;

    if (netSalary < 0) {
      return res.status(400).json({
        success: false,
        message: "Deductions cannot exceed gross salary",
      });
    }

    // Save latest salary details for future use
    await EmployeeSalary.findOneAndUpdate(
      { employee: employeeId },
      {
        employee: employeeId,
        basicSalary: basic,
        allowances: allowance,
        deductions: deduction,
        netSalary,
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Create or update payroll for this employee and month
    const payroll = await Payroll.findOneAndUpdate(
      {
        employee: employeeId,
        month: payrollMonth,
        year: payrollYear,
      },
      {
        employee: employeeId,
        month: payrollMonth,
        year: payrollYear,
        basicSalary: basic,
        allowances: allowance,
        deductions: deduction,
        netSalary,
      },
      { upsert: true, new: true, runValidators: true }
    ).populate("employee", "employeeId name department designation");

    return res.status(200).json({
      success: true,
      message: "Payroll processed successfully",
      payroll,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MONTHLY PAYROLL RECORDS
exports.getPayrollRecords = async (req, res) => {
  try {
    const { month, year } = req.query;

    const filter = {};

    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const payrolls = await Payroll.find(filter)
      .populate("employee", "employeeId name department designation")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payrolls.length,
      payrolls,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
