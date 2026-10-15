const SystemSettings = require("../models/systemSettingsModel");

exports.getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get system settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch system settings",
      error: error.message,
    });
  }
};


// =========================================
// UPDATE SYSTEM SETTINGS
// =========================================
exports.updateSystemSettings = async (req, res) => {
  try {
    const settingsData = req.body;

    let settings = await SystemSettings.findOne();

    // Agar document nahi hai to create karo
    if (!settings) {
      settings = await SystemSettings.create(settingsData);

      return res.status(201).json({
        success: true,
        message: "System settings saved successfully",
        settings,
      });
    }

    // Existing settings update
    settings.set(settingsData);

    await settings.save();

    res.status(200).json({
      success: true,
      message: "System settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update system settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update system settings",
      error: error.message,
    });
  }
};