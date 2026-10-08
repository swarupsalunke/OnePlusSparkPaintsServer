const User = require("../../models/superadmin/User");
const Visit = require("../../models/superadmin/Visit");

const getMyVisits = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "name userId email role"
    );

    if (!user || user.role !== "SALES_EXECUTIVE") {
      return res.status(403).json({
        success: false,
        message: "Sales Executive not found",
      });
    }

    const visits = await Visit.find({
      assignedTo: user.name,
    }).sort({
      visitDate: 1,
      visitTime: 1,
    });

    res.status(200).json({
      success: true,
      count: visits.length,
      data: visits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned visits",
      error: error.message,
    });
  }
};

module.exports = {
  getMyVisits,
};