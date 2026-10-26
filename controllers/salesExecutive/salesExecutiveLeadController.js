
const SalesExecutiveLead = require("../../models/salesExecutive/SalesExecutiveLead");

// Create Lead
const createLead = async (req, res) => {
  try {
    const {
       customerName,
  contactDetails,
  businessType,
  address,
  city,
  state,
  pinCode,
  productInterest,
  estimatedBusiness,
  source,
  remarks,
  status,
  assignedTo,
    } = req.body;

    if (
      !customerName ||
      !contactDetails ||
      !businessType ||
      !address ||
      !productInterest ||
      estimatedBusiness === undefined ||
      estimatedBusiness === null ||
      estimatedBusiness === "" ||
      !source
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required lead information",
      });
    }

   const lead = await SalesExecutiveLead.create({
  customerName,
  contactDetails,
  businessType,
  address,
  city,
  state,
  pinCode,
  productInterest,
  estimatedBusiness,
  source,
  remarks,
  status,
  assignedTo,
});

    return res.status(201).json({
      success: true,
      message: "Sales Executive lead created successfully",
      lead,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await SalesExecutiveLead.find()
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Lead By ID
const getLeadById = async (req, res) => {
  try {
    const lead = await SalesExecutiveLead.findById(req.params.id)
      .populate("assignedTo", "name email role");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Lead
const updateLead = async (req, res) => {
  try {
    const allowedFields = [
      "customerName",
      "contactDetails",
      "businessType",
      "address",
      "city",
      "state",
      "pinCode",
      "productInterest",
      "estimatedBusiness",
      "source",
      "remarks",
      "status",
      "assignedTo",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    const lead = await SalesExecutiveLead.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("assignedTo", "name email role");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Lead
const deleteLead = async (req, res) => {
  try {
    const lead = await SalesExecutiveLead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
};
