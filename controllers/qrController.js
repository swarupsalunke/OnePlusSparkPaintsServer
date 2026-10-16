const mongoose = require("mongoose");
const QR = require("../models/QR");
const QRScanHistory = require("../models/QRScanHistory");
const Product = require("../models/Product");
const User = require("../models/User");

const createQR = async (req, res) => {
  try {
    const {
      qrCode,
      qrType,
      product,
      batchNo,
      dealer,
      painter,
      points,
      expiryDate,
    } = req.body;


    // Required fields
    if (
      !qrCode ||
      !qrType ||
      !product ||
      !batchNo ||
      !dealer ||
      !painter ||
      points === undefined ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required",
      });
    }


    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(product) ||
      !mongoose.Types.ObjectId.isValid(dealer) ||
      !mongoose.Types.ObjectId.isValid(painter)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product, dealer or painter ID",
      });
    }


    // Check duplicate QR
    const existingQR = await QR.findOne({
      qrCode: qrCode.trim(),
    });

    if (existingQR) {
      return res.status(400).json({
        success: false,
        message: "QR/Barcode already exists",
      });
    }


    // Check product
    const productData = await Product.findById(product);

    if (!productData) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }


    // Check dealer
    const dealerData = await User.findById(dealer);

    if (!dealerData || dealerData.role !== "DEALER") {
      return res.status(400).json({
        success: false,
        message: "Invalid Dealer",
      });
    }


    // Check painter
    const painterData = await User.findById(painter);

    if (!painterData) {
      return res.status(400).json({
        success: false,
        message: "Invalid Painter",
      });
    }


    // Check expiry date
    const expiry = new Date(expiryDate);

    if (isNaN(expiry.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiry date",
      });
    }


    // Create QR
    const qr = await QR.create({
      qrCode: qrCode.trim(),
      qrType,
      product,
      batchNo: batchNo.trim(),
      dealer,
      painter,
      points,
      status: "Unused",
      generatedOn: new Date(),
      expiryDate: expiry,
    });


    const populatedQR = await QR.findById(qr._id)
      .populate("product")
      .populate("dealer", "name email mobile role")
      .populate("painter", "name email mobile role");


    return res.status(201).json({
      success: true,
      message: "QR/Barcode created successfully",
      qr: populatedQR,
    });

  } catch (error) {

    console.error("Create QR error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create QR/Barcode",
      error: error.message,
    });
  }
};



// =====================================================
// GET ALL QR / BARCODE
// =====================================================

const getAllQR = async (req, res) => {
  try {

    const {
      search,
      status,
      qrType,
      product,
      dealer,
      painter,
    } = req.query;


    const filter = {};


    // Search
    if (search && search.trim()) {

      const searchValue = search.trim();

      filter.$or = [
        {
          qrCode: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          batchNo: {
            $regex: searchValue,
            $options: "i",
          },
        },
      ];
    }


    // Status
    if (status) {
      filter.status = status;
    }


    // QR Type
    if (qrType) {
      filter.qrType = qrType;
    }


    // Product
    if (
      product &&
      mongoose.Types.ObjectId.isValid(product)
    ) {
      filter.product = product;
    }


    // Dealer
    if (
      dealer &&
      mongoose.Types.ObjectId.isValid(dealer)
    ) {
      filter.dealer = dealer;
    }


    // Painter
    if (
      painter &&
      mongoose.Types.ObjectId.isValid(painter)
    ) {
      filter.painter = painter;
    }


    // Automatically mark expired QR
    await QR.updateMany(
      {
        expiryDate: {
          $lt: new Date(),
        },
        status: {
          $nin: ["Used", "Blocked"],
        },
      },
      {
        $set: {
          status: "Expired",
        },
      }
    );


    const qrs = await QR.find(filter)
      .populate("product")
      .populate("dealer", "name email mobile role")
      .populate("painter", "name email mobile role")
      .sort({
        generatedOn: -1,
      });


    return res.status(200).json({
      success: true,
      count: qrs.length,
      qrs,
    });

  } catch (error) {

    console.error("Get QR error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch QR/Barcode",
      error: error.message,
    });
  }
};



// =====================================================
// GET SINGLE QR
// =====================================================

const getQRById = async (req, res) => {
  try {

    const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR ID",
      });
    }


    const qr = await QR.findById(id)
      .populate("product")
      .populate("dealer", "name email mobile role")
      .populate("painter", "name email mobile role");


    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "QR/Barcode not found",
      });
    }


    // Expiry check
    if (
      qr.expiryDate < new Date() &&
      qr.status !== "Used" &&
      qr.status !== "Blocked"
    ) {
      qr.status = "Expired";
      await qr.save();
    }


    return res.status(200).json({
      success: true,
      qr,
    });

  } catch (error) {

    console.error("Get QR by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch QR/Barcode",
      error: error.message,
    });
  }
};



// =====================================================
// UPDATE QR
// =====================================================

const updateQR = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      qrCode,
      qrType,
      product,
      batchNo,
      dealer,
      painter,
      points,
      status,
      expiryDate,
    } = req.body;


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR ID",
      });
    }


    const qr = await QR.findById(id);

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "QR/Barcode not found",
      });
    }


    // QR code duplicate check
    if (qrCode && qrCode !== qr.qrCode) {

      const duplicateQR = await QR.findOne({
        qrCode: qrCode.trim(),
        _id: {
          $ne: id,
        },
      });

      if (duplicateQR) {
        return res.status(400).json({
          success: false,
          message: "QR/Barcode already exists",
        });
      }

      qr.qrCode = qrCode.trim();
    }


    // Product
    if (product) {

      if (!mongoose.Types.ObjectId.isValid(product)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const productData = await Product.findById(product);

      if (!productData) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      qr.product = product;
    }


    // Dealer
    if (dealer) {

      if (!mongoose.Types.ObjectId.isValid(dealer)) {
        return res.status(400).json({
          success: false,
          message: "Invalid dealer ID",
        });
      }

      const dealerData = await User.findById(dealer);

      if (!dealerData || dealerData.role !== "DEALER") {
        return res.status(400).json({
          success: false,
          message: "Invalid Dealer",
        });
      }

      qr.dealer = dealer;
    }


    // Painter
    if (painter) {

      if (!mongoose.Types.ObjectId.isValid(painter)) {
        return res.status(400).json({
          success: false,
          message: "Invalid painter ID",
        });
      }

      const painterData = await User.findById(painter);

      if (!painterData) {
        return res.status(400).json({
          success: false,
          message: "Invalid Painter",
        });
      }

      qr.painter = painter;
    }


    if (qrType) {
      qr.qrType = qrType;
    }


    if (batchNo) {
      qr.batchNo = batchNo.trim();
    }


    if (points !== undefined) {
      qr.points = points;
    }


    if (status) {
      qr.status = status;
    }


    if (expiryDate) {

      const expiry = new Date(expiryDate);

      if (isNaN(expiry.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date",
        });
      }

      qr.expiryDate = expiry;
    }


    await qr.save();


    const updatedQR = await QR.findById(qr._id)
      .populate("product")
      .populate("dealer", "name email mobile role")
      .populate("painter", "name email mobile role");


    return res.status(200).json({
      success: true,
      message: "QR/Barcode updated successfully",
      qr: updatedQR,
    });

  } catch (error) {

    console.error("Update QR error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update QR/Barcode",
      error: error.message,
    });
  }
};



// =====================================================
// DELETE QR
// =====================================================

const deleteQR = async (req, res) => {
  try {

    const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR ID",
      });
    }


    const qr = await QR.findById(id);

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "QR/Barcode not found",
      });
    }


    await QR.findByIdAndDelete(id);


    return res.status(200).json({
      success: true,
      message: "QR/Barcode deleted successfully",
    });

  } catch (error) {

    console.error("Delete QR error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete QR/Barcode",
      error: error.message,
    });
  }
};



// =====================================================
// SCAN QR / BARCODE
// =====================================================

const scanQR = async (req, res) => {
  try {

    const {
      qrCode,
      dealer,
      painter,
      deviceDetails,
      gpsLocation,
    } = req.body;


    if (!qrCode || !dealer || !painter) {
      return res.status(400).json({
        success: false,
        message: "QR code, dealer and painter are required",
      });
    }


    if (
      !mongoose.Types.ObjectId.isValid(dealer) ||
      !mongoose.Types.ObjectId.isValid(painter)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid dealer or painter ID",
      });
    }


    const dealerData = await User.findById(dealer);

    if (!dealerData || dealerData.role !== "DEALER") {
      return res.status(400).json({
        success: false,
        message: "Invalid Dealer",
      });
    }


    const painterData = await User.findById(painter);

    if (!painterData) {
      return res.status(400).json({
        success: false,
        message: "Invalid Painter",
      });
    }


    // Find QR
    const qr = await QR.findOne({
      qrCode: qrCode.trim(),
    });


    // =================================================
    // INVALID QR
    // =================================================

    if (!qr) {

      return res.status(404).json({
        success: false,
        message: "Invalid QR/Barcode",
        scanStatus: "Invalid",
      });
    }


    // =================================================
    // EXPIRED QR
    // =================================================

    if (
      qr.expiryDate < new Date() &&
      qr.status !== "Used" &&
      qr.status !== "Blocked"
    ) {

      qr.status = "Expired";
      await qr.save();


      await QRScanHistory.create({
        qrCode: qr._id,
        product: qr.product,
        dealer,
        painter,
        pointsAwarded: 0,
        deviceDetails: deviceDetails || "",
        gpsLocation: gpsLocation || {},
        scanStatus: "Invalid",
      });


      return res.status(400).json({
        success: false,
        message: "QR/Barcode has expired",
        scanStatus: "Invalid",
      });
    }


    // =================================================
    // BLOCKED QR
    // =================================================

    if (qr.status === "Blocked") {

      await QRScanHistory.create({
        qrCode: qr._id,
        product: qr.product,
        dealer,
        painter,
        pointsAwarded: 0,
        deviceDetails: deviceDetails || "",
        gpsLocation: gpsLocation || {},
        scanStatus: "Fraud",
      });


      return res.status(400).json({
        success: false,
        message: "QR/Barcode is blocked",
        scanStatus: "Fraud",
      });
    }


    // =================================================
    // DUPLICATE SCAN
    // =================================================

    if (qr.status === "Used") {

      await QRScanHistory.create({
        qrCode: qr._id,
        product: qr.product,
        dealer,
        painter,
        pointsAwarded: 0,
        deviceDetails: deviceDetails || "",
        gpsLocation: gpsLocation || {},
        scanStatus: "Duplicate",
      });


      return res.status(400).json({
        success: false,
        message: "QR/Barcode has already been used",
        scanStatus: "Duplicate",
      });
    }


    // =================================================
    // VALID SCAN
    // =================================================

    qr.status = "Used";

    await qr.save();


    const scanHistory = await QRScanHistory.create({
      qrCode: qr._id,
      product: qr.product,
      dealer,
      painter,
      pointsAwarded: qr.points,
      deviceDetails: deviceDetails || "",
      gpsLocation: gpsLocation || {},
      scanStatus: "Valid",
    });


    return res.status(200).json({
      success: true,
      message: "QR/Barcode scanned successfully",
      scanStatus: "Valid",
      pointsAwarded: qr.points,
      scanHistory,
    });

  } catch (error) {

    console.error("Scan QR error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to scan QR/Barcode",
      error: error.message,
    });
  }
};



// =====================================================
// GET SCAN HISTORY
// =====================================================

const getScanHistory = async (req, res) => {
  try {

    const {
      scanStatus,
      qrCode,
      dealer,
      painter,
    } = req.query;


    const filter = {};


    if (scanStatus) {
      filter.scanStatus = scanStatus;
    }


    if (
      qrCode &&
      mongoose.Types.ObjectId.isValid(qrCode)
    ) {
      filter.qrCode = qrCode;
    }


    if (
      dealer &&
      mongoose.Types.ObjectId.isValid(dealer)
    ) {
      filter.dealer = dealer;
    }


    if (
      painter &&
      mongoose.Types.ObjectId.isValid(painter)
    ) {
      filter.painter = painter;
    }


    const history = await QRScanHistory.find(filter)
      .populate({
        path: "qrCode",
        select: "qrCode qrType batchNo status",
      })
      .populate("product")
      .populate("dealer", "name email mobile role")
      .populate("painter", "name email mobile role")
      .sort({
        scannedAt: -1,
      });


    return res.status(200).json({
      success: true,
      count: history.length,
      history,
    });

  } catch (error) {

    console.error("Get scan history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch scan history",
      error: error.message,
    });
  }
};



module.exports = {
  createQR,
  getAllQR,
  getQRById,
  updateQR,
  deleteQR,
  scanQR,
  getScanHistory,
};