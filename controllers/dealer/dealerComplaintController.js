const DealerComplaint = require("../../models/dealer/DealerComplaint");

const createComplaint = async (req, res) => {
  try {
    const dealerId = req.user?._id || req.user?.id || req.user?.userId;

    if (!dealerId) {
      return res.status(401).json({
        success: false,
        message: "Dealer authentication required",
      });
    }

    const { complaintType, subject, description } = req.body;

    if (!complaintType || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: "Complaint type, subject and description are required",
      });
    }

    const complaintId = `CMP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const complaint = await DealerComplaint.create({
      complaintId,
      dealer: dealerId,
      complaintType,
      subject,
      description,
      images: req.files?.images?.map((file) => `/uploads/complaints/${file.filename}`) || [],
      documents: req.files?.documents?.map((file) => `/uploads/complaints/${file.filename}`) || [],
    });

    res.status(201).json({
      success: true,
      message: "Complaint raised successfully",
      complaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to raise complaint",
      error: error.message,
    });
  }
};

const getDealerComplaints = async (req, res) => {
  try {
    const dealerId = req.user?._id || req.user?.id || req.user?.userId;

    const { search, fromDate, toDate } = req.query;

    const filter = {
      dealer: dealerId,
    };

    if (search) {
      filter.$or = [
        { complaintId: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { complaintType: { $regex: search, $options: "i" } },
      ];
    }

    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        filter.createdAt.$gte = new Date(`${fromDate}T00:00:00.000Z`);
      }

      if (toDate) {
        filter.createdAt.$lte = new Date(`${toDate}T23:59:59.999Z`);
      }
    }

    const complaints = await DealerComplaint.find(filter)
      .sort({ createdAt: -1 })
      .populate("dealer", "name email mobile");

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("Get complaints error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const dealerId = req.user?._id || req.user?.id || req.user?.userId;

    const complaint = await DealerComplaint.findOne({
      _id: req.params.id,
      dealer: dealerId,
    }).populate("dealer", "name email mobile");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error("Get complaint details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch complaint details",
      error: error.message,
    });
  }
};

module.exports = {
  createComplaint,
  getDealerComplaints,
  getComplaintById,
};