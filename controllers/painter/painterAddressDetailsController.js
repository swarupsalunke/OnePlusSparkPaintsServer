const PainterAddressDetails = require("../../models/painter/PainterAddressDetails");

const getPainterAddressDetails = async (req, res) => {
  try {
    const painterId = req.user.userId;

    const address = await PainterAddressDetails.findOne({ painterId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address details not found",
      });
    }

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error("Get Painter Address Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch address details",
      error: error.message,
    });
  }
};

const createPainterAddressDetails = async (req, res) => {
  try {
    const painterId = req.user.userId;
    const { address, city, district, state, pinCode } = req.body;

    if (!address || !city || !district || !state || !pinCode) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required",
      });
    }

    const existingAddress = await PainterAddressDetails.findOne({ painterId });

    if (existingAddress) {
      return res.status(409).json({
        success: false,
        message: "Address details already exist",
      });
    }

    const newAddress = await PainterAddressDetails.create({
      painterId,
      address,
      city,
      district,
      state,
      pinCode,
    });

    res.status(201).json({
      success: true,
      message: "Address details saved successfully",
      data: newAddress,
    });
  } catch (error) {
    console.error("Create Painter Address Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save address details",
      error: error.message,
    });
  }
};

const updatePainterAddressDetails = async (req, res) => {
  try {
    const painterId = req.user.userId;
    const { address, city, district, state, pinCode } = req.body;

    if (!address || !city || !district || !state || !pinCode) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required",
      });
    }

    const updatedAddress = await PainterAddressDetails.findOneAndUpdate(
      { painterId },
      {
        address,
        city,
        district,
        state,
        pinCode,
      },
      {
       returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address details not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address details updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Update Painter Address Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update address details",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterAddressDetails,
  createPainterAddressDetails,
  updatePainterAddressDetails,
};