const SalesExecutiveAttendance = require("../../models/salesExecutive/SalesExecutiveAttendance");

const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

const checkIn = async (req, res) => {
  try {
    const salesExecutiveId = req.user.userId;
    const { latitude, longitude, remarks } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "GPS location is mandatory for check-in",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Selfie is mandatory for check-in",
      });
    }

    const today = getTodayDate();

    const existingAttendance = await SalesExecutiveAttendance.findOne({
      salesExecutive: salesExecutiveId,
      date: today,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Check-in already completed for today",
      });
    }

    const selfiePath = `/uploads/sales-executive/attendance/${req.file.filename}`;

    const attendance = await SalesExecutiveAttendance.create({
      salesExecutive: salesExecutiveId,
      date: today,
      checkIn: {
        timestamp: new Date(),
        latitude,
        longitude,
        selfie: selfiePath,
        remarks: remarks || "",
      },
      status: "CHECKED_IN",
    });

    return res.status(201).json({
      success: true,
      message: "Check-in successful",
      attendance,
    });
  } catch (error) {
    console.error("Sales Executive Check-In Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check-in",
      error: error.message,
    });
  }
};

const checkOut = async (req, res) => {
  try {
    const salesExecutiveId = req.user.userId;
    const { latitude, longitude } = req.body;

    const today = getTodayDate();

    const attendance = await SalesExecutiveAttendance.findOne({
      salesExecutive: salesExecutiveId,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "Check-in is required before check-out",
      });
    }

    if (attendance.status === "CHECKED_OUT") {
      return res.status(400).json({
        success: false,
        message: "Check-out already completed for today",
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "GPS location is mandatory for check-out",
      });
    }

    attendance.checkOut = {
      timestamp: new Date(),
      latitude,
      longitude,
    };

    attendance.status = "CHECKED_OUT";

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Check-out successful",
      attendance,
    });
  } catch (error) {
    console.error("Sales Executive Check-Out Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check-out",
      error: error.message,
    });
  }
};

const updateLiveLocation = async (req, res) => {
  try {
    const salesExecutiveId = req.user.userId;
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "GPS location is required",
      });
    }

    const today = getTodayDate();

    const attendance = await SalesExecutiveAttendance.findOne({
      salesExecutive: salesExecutiveId,
      date: today,
      status: "CHECKED_IN",
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "Active check-in not found",
      });
    }

    attendance.liveLocation = {
      latitude,
      longitude,
      updatedAt: new Date(),
    };

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Live location updated",
      liveLocation: attendance.liveLocation,
    });
  } catch (error) {
    console.error("Live Location Update Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update live location",
      error: error.message,
    });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const salesExecutiveId = req.user.userId;

    const attendance = await SalesExecutiveAttendance.find({
      salesExecutive: salesExecutiveId,
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Attendance History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance history",
      error: error.message,
    });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const salesExecutiveId = req.user.userId;
    const today = getTodayDate();

    const attendance = await SalesExecutiveAttendance.findOne({
      salesExecutive: salesExecutiveId,
      date: today,
    });

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Today Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch today's attendance",
      error: error.message,
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  updateLiveLocation,
  getAttendanceHistory,
  getTodayAttendance,
};