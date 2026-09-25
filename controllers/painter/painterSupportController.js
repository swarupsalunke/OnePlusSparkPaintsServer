const PainterSupport = require("../../models/painter/PainterSupport");

const createPainterSupport = async (req, res) => {
  try {
    const { subject, email, message } = req.body;

    if (!subject || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject, email and message are required",
      });
    }

    const supportRequest = await PainterSupport.create({
      subject,
      email,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Support request submitted successfully",
      data: supportRequest,
    });
  } catch (error) {
    console.error("Create Painter Support Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit support request",
      error: error.message,
    });
  }
};

module.exports = {
  createPainterSupport,
};