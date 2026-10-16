const Birthday = require("../models/birthdayModel");

// =====================================================
// CREATE BIRTHDAY
// =====================================================
exports.createBirthday = async (req, res) => {
  try {
    const {
      name,
      userType,
      customType,
      dateOfBirth,
      mobileNumber,
      location,
      reminderEnabled,
    } = req.body;

    const birthday = await Birthday.create({
      name,
      userType,
      customType: customType || "",
      dateOfBirth,
      mobileNumber: mobileNumber || "",
      location: location || "",
      reminderEnabled:
        reminderEnabled !== undefined
          ? reminderEnabled
          : true,
    });

    res.status(201).json({
      success: true,
      message: "Birthday created successfully",
      birthday,
    });
  } catch (error) {
    console.error("Create birthday error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create birthday",
      error: error.message,
    });
  }
};


// =====================================================
// GET ALL BIRTHDAYS
// =====================================================
exports.getBirthdays = async (req, res) => {
  try {
    const birthdays = await Birthday.find().sort({
      dateOfBirth: 1,
    });

    res.status(200).json({
      success: true,
      count: birthdays.length,
      birthdays,
    });
  } catch (error) {
    console.error("Get birthdays error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch birthdays",
      error: error.message,
    });
  }
};


// =====================================================
// GET SINGLE BIRTHDAY
// =====================================================
exports.getBirthdayById = async (req, res) => {
  try {
    const birthday = await Birthday.findById(
      req.params.id
    );

    if (!birthday) {
      return res.status(404).json({
        success: false,
        message: "Birthday not found",
      });
    }

    res.status(200).json({
      success: true,
      birthday,
    });
  } catch (error) {
    console.error("Get birthday error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch birthday",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE BIRTHDAY
// =====================================================
exports.updateBirthday = async (req, res) => {
  try {
    const {
      name,
      userType,
      customType,
      dateOfBirth,
      mobileNumber,
      location,
      reminderEnabled,
    } = req.body;

    const birthday =
      await Birthday.findByIdAndUpdate(
        req.params.id,
        {
          name,
          userType,
          customType: customType || "",
          dateOfBirth,
          mobileNumber: mobileNumber || "",
          location: location || "",
          reminderEnabled:
            reminderEnabled !== undefined
              ? reminderEnabled
              : true,
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!birthday) {
      return res.status(404).json({
        success: false,
        message: "Birthday not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Birthday updated successfully",
      birthday,
    });
  } catch (error) {
    console.error("Update birthday error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update birthday",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE BIRTHDAY
// =====================================================
exports.deleteBirthday = async (req, res) => {
  try {
    const birthday =
      await Birthday.findByIdAndDelete(
        req.params.id
      );

    if (!birthday) {
      return res.status(404).json({
        success: false,
        message: "Birthday not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Birthday deleted successfully",
    });
  } catch (error) {
    console.error("Delete birthday error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete birthday",
      error: error.message,
    });
  }
};