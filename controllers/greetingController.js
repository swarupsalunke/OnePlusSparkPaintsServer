const Greeting = require("../models/greetingModel");
const Birthday = require("../models/birthdayModel");

// =====================================================
// SEND GREETING
// =====================================================
exports.sendGreeting = async (req, res) => {
  try {
    const {
      birthdayId,
      message,
    } = req.body;

    const birthday = await Birthday.findById(birthdayId);

    if (!birthday) {
      return res.status(404).json({
        success: false,
        message: "Birthday not found",
      });
    }

    const greeting = await Greeting.create({
      birthdayId,
      recipientName: birthday.name,
      message,
      status: "SENT",
      sentAt: new Date(),
    });

    // Mark greeting as sent
    await Birthday.findByIdAndUpdate(
      birthdayId,
      {
        greetingSent: true,
      }
    );

    res.status(201).json({
      success: true,
      message: "Greeting sent successfully",
      greeting,
    });
  } catch (error) {
    console.error("Send greeting error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send greeting",
      error: error.message,
    });
  }
};


// =====================================================
// GET GREETING HISTORY
// =====================================================
exports.getGreetings = async (req, res) => {
  try {
    const greetings = await Greeting.find()
      .populate("birthdayId")
      .sort({
        sentAt: -1,
      });

    res.status(200).json({
      success: true,
      count: greetings.length,
      greetings,
    });
  } catch (error) {
    console.error("Get greetings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch greetings",
      error: error.message,
    });
  }
};