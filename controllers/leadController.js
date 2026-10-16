const Lead = require("../models/Lead");
const User = require("../models/User");

const createLead = async (req, res) => {
  try {
    const {
      leadName,
      companyName,
      mobile,
      leadSource,
      status,
      assignedTo,
      territory,
    } = req.body;

    // Generate Lead Number
    const lastLead = await Lead.findOne()
      .sort({ createdAt: -1 })
      .select("leadNumber");

    let nextNumber = 1;

    if (lastLead?.leadNumber) {
      const numberPart = parseInt(
        lastLead.leadNumber.split("-").pop(),
        10
      );

      if (!isNaN(numberPart)) {
        nextNumber = numberPart + 1;
      }
    }

    const leadNumber = `LD-${String(nextNumber).padStart(3, "0")}`;

    // Check assigned user
    if (assignedTo) {
      const salesExecutive = await User.findOne({
        _id: assignedTo,
        role: "SALES_EXECUTIVE",
      });

      if (!salesExecutive) {
        return res.status(400).json({
          success: false,
          message: "Invalid Sales Executive",
        });
      }
    }

    const lead = await Lead.create({
      leadNumber,
      leadName,
      companyName,
      mobile,
      leadSource,
      status: status || "New",
      assignedTo: assignedTo || null,
      territory,
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    console.error("Create lead error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create lead",
    });
  }
};


// ==========================================
// GET ALL LEADS
// ==========================================

const getAllLeads = async (req, res) => {
  try {
    const {
      search,
      status,
      leadSource,
      assignedTo,
      territory,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    // Status
    if (status) {
      filter.status = status;
    }

    // Lead Source
    if (leadSource) {
      filter.leadSource = leadSource;
    }

    // Sales Executive
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    // Territory
    if (territory) {
      filter.territory = {
        $regex: territory,
        $options: "i",
      };
    }

    // Search
    if (search) {
      filter.$or = [
        {
          leadNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          leadName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          companyName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          mobile: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Date Range
    if (startDate || endDate) {
      filter.createdOn = {};

      if (startDate) {
        filter.createdOn.$gte = new Date(
          `${startDate}T00:00:00`
        );
      }

      if (endDate) {
        filter.createdOn.$lte = new Date(
          `${endDate}T23:59:59`
        );
      }
    }

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email role")
      .sort({
        createdOn: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error("Get all leads error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
};


// ==========================================
// GET SINGLE LEAD
// ==========================================

const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email role");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error("Get lead error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch lead",
    });
  }
};


// ==========================================
// UPDATE LEAD
// ==========================================

const updateLead = async (req, res) => {
  try {
    const {
      leadName,
      companyName,
      mobile,
      leadSource,
      status,
      assignedTo,
      territory,
    } = req.body;

    // Validate Sales Executive
    if (assignedTo) {
      const salesExecutive = await User.findOne({
        _id: assignedTo,
        role: "SALES_EXECUTIVE",
      });

      if (!salesExecutive) {
        return res.status(400).json({
          success: false,
          message: "Invalid Sales Executive",
        });
      }
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        leadName,
        companyName,
        mobile,
        leadSource,
        status,
        assignedTo: assignedTo || null,
        territory,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).populate("assignedTo", "name email role");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    console.error("Update lead error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update lead",
    });
  }
};


// ==========================================
// DELETE LEAD
// ==========================================

const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(
      req.params.id
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete lead error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete lead",
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