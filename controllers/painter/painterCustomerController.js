const PainterCustomer = require("../../models/painter/PainterCustomer");
const PainterLead = require("../../models/painter/PainterLead");

// Create Customer
const createCustomer = async (req, res) => {
  try {
    const {
      name,
      mobile,
      city,
      productInterest,
      estimatedBusiness,
      source,
    } = req.body;

    const painterId = req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const customer = await PainterCustomer.create({
      name,
      mobile,
      city,
      productInterest,
      estimatedBusiness,
      source,
    });

    // Generate Lead ID
    const lastLead = await PainterLead.findOne().sort({
      createdAt: -1,
    });

    let nextLeadNumber = 2048;

    if (lastLead && lastLead.leadId) {
      const lastNumber = parseInt(
        lastLead.leadId.replace("LD-", ""),
        10
      );

      if (!isNaN(lastNumber)) {
        nextLeadNumber = lastNumber + 1;
      }
    }

    // Create Lead automatically for logged-in painter
    const lead = await PainterLead.create({
      leadId: `LD-${nextLeadNumber}`,
      customer: customer._id,
      customerName: customer.name,
      area: customer.city,
      assignedPainter: painterId,
      lastActivity: new Date(),
      status: "Assigned",
    });

    res.status(201).json({
      success: true,
      message: "Customer and lead created successfully",
      customer,
      lead,
    });
  } catch (error) {
    console.error("Create Customer Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create customer and lead",
      error: error.message,
    });
  }
};

// Get Customers
const getCustomers = async (req, res) => {
  try {
    const customers = await PainterCustomer.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

// Get Customer By ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await PainterCustomer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
};