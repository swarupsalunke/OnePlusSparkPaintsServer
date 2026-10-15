const Employee = require("../models/employeeModel");

// Create Employee
exports.createEmployee = async (req, res) => {
  try {
    const {
      name,
      department,
      designation,
      email,
      mobile,
      location,
      employmentType,
      status,
      joiningDate,
    } = req.body;

    if (!name || !email || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name, email and mobile are required",
      });
    }

    const existingEmployee = await Employee.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    const employee = await Employee.create({
      name,
      department,
      designation,
      email,
      mobile,
      location,
      employmentType,
      status,
      joiningDate,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    console.error("Create employee error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create employee",
    });
  }
};

// Get All Employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch employees",
    });
  }
};

// Get Single Employee
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Get employee error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch employee",
    });
  }
};

// Update Employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (req.body.email) {
      const existingEmployee = await Employee.findOne({
        email: req.body.email.toLowerCase().trim(),
        _id: { $ne: req.params.id },
      });

      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Another employee with this email already exists",
        });
      }
    }

    const allowedFields = [
      "name",
      "department",
      "designation",
      "email",
      "mobile",
      "location",
      "employmentType",
      "status",
      "joiningDate",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        employee[field] = req.body[field];
      }
    });

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Update employee error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update employee",
    });
  }
};

// Delete Employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete employee error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete employee",
    });
  }
};