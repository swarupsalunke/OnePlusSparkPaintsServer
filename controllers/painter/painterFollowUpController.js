const PainterFollowUpNote = require("../../models/painter/PainterFollowUpNote");
const PainterLead = require("../../models/painter/PainterLead");

// Create Follow-up
const createFollowUp = async (req, res) => {
  try {
    const { lead, note, nextFollowUp } = req.body;

    const existingLead = await PainterLead.findById(lead);

    if (!existingLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const followUp = await PainterFollowUpNote.create({
      lead,
      note,
      nextFollowUp,
    });

    existingLead.lastActivity = new Date();
    await existingLead.save();

    const populatedFollowUp =
      await PainterFollowUpNote.findById(followUp._id).populate("lead");

    res.status(201).json({
      success: true,
      message: "Follow-up saved successfully",
      followUp: populatedFollowUp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save follow-up",
      error: error.message,
    });
  }
};

// Get All Follow-ups
const getFollowUps = async (req, res) => {
  try {
    const followUps = await PainterFollowUpNote.find()
      .populate("lead")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      followUps,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch follow-ups",
      error: error.message,
    });
  }
};

// Get Follow-ups By Lead
const getFollowUpsByLead = async (req, res) => {
  try {
    const followUps = await PainterFollowUpNote.find({
      lead: req.params.leadId,
    })
      .populate("lead")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      followUps,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch lead follow-ups",
      error: error.message,
    });
  }
};

module.exports = {
  createFollowUp,
  getFollowUps,
  getFollowUpsByLead,
};