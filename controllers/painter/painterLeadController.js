const PainterLead = require("../../models/painter/PainterLead");

const createLead = async (req, res) => {
  try {
    const { customer, customerName, area } = req.body;

    const painterId = req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter ID not found in authentication token",
      });
    }

    if (!customer || !customerName || !area) {
      return res.status(400).json({
        success: false,
        message: "Customer, customer name and area are required",
      });
    }

    const lastLead = await PainterLead.findOne().sort({ createdAt: -1 });

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

    const lead = await PainterLead.create({
      leadId: `LD-${nextLeadNumber}`,
      customer,
      customerName,
      area,
      assignedPainter: painterId,
      lastActivity: new Date(),
      status: "Assigned",
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
      error: error.message,
    });
  }
};

const getLeads = async (req, res) => {
  try {
    const painterId = req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter ID not found in authentication token",
      });
    }

    const leads = await PainterLead.find({
      assignedPainter: painterId,
    })
      .populate("customer")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      leads,
    });
  } catch (error) {
    console.error("Get leads error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
      error: error.message,
    });
  }
};

const getLeadById = async (req, res) => {
  try {
    const painterId = req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter ID not found in authentication token",
      });
    }

    const lead = await PainterLead.findOne({
      _id: req.params.id,
      assignedPainter: painterId,
    }).populate("customer");

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
    console.error("Get lead by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch lead",
      error: error.message,
    });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const painterId = req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter ID not found in authentication token",
      });
    }

    const allowedStatuses = [
      "Assigned",
      "Accepted",
      "Rejected",
      "In Progress",
      "Completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead status",
      });
    }

    const lead = await PainterLead.findOne({
      _id: req.params.id,
      assignedPainter: painterId,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (!lead.statusHistory || lead.statusHistory.length === 0) {
      lead.statusHistory = [
        {
          status: lead.status,
          date: lead.createdAt || new Date(),
        },
      ];
    }

    if (lead.status !== status) {
      lead.status = status;
      lead.lastActivity = new Date();

      lead.statusHistory.push({
        status,
        date: new Date(),
      });
    }

    await lead.save();

    await lead.populate("customer");

    res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      lead,
    });
  } catch (error) {
    console.error("Update lead status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update lead status",
      error: error.message,
    });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
};