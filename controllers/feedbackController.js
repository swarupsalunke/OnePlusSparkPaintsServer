const Feedback = require("../models/feedbackModel");

// Create Feedback
exports.createFeedback = async (req, res) => {
  try {
    const { title, feedbackType, description, painter, location, priority } =
      req.body;

    const feedback = await Feedback.create({
      title,
      feedbackType,
      description,
      painter,
      location,
      priority,
      image: req.files?.image?.[0]?.path || "",
      audio: req.files?.audio?.[0]?.path || "",
      video: req.files?.video?.[0]?.path || "",
    });

    res.status(201).json({
      success: true,
      message: "Feedback created successfully",
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const {
      feedbackType,
      status,
      painter,
      location,
      search,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (feedbackType) {
      filter.feedbackType = feedbackType;
    }

    if (status) {
      filter.status = status;
    }

    if (painter) {
      filter.painter = { $regex: painter, $options: "i" };
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { painter: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const feedbacks = await Feedback.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Feedback
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Feedback
exports.updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Feedback Status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback status updated successfully",
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Dashboard Statistics
exports.getFeedbackStats = async (req, res) => {
  try {
    const total = await Feedback.countDocuments();

    const open = await Feedback.countDocuments({ status: "OPEN" });
    const assigned = await Feedback.countDocuments({ status: "ASSIGNED" });
    const underReview = await Feedback.countDocuments({
      status: "UNDER_REVIEW",
    });
    const resolved = await Feedback.countDocuments({ status: "RESOLVED" });
    const closed = await Feedback.countDocuments({ status: "CLOSED" });

    const complaints = await Feedback.countDocuments({
      feedbackType: "COMPLAINT",
    });

    const suggestions = await Feedback.countDocuments({
      feedbackType: "SUGGESTION",
    });

    const productFeedback = await Feedback.countDocuments({
      feedbackType: "PRODUCT_FEEDBACK",
    });

    const serviceFeedback = await Feedback.countDocuments({
      feedbackType: "SERVICE_FEEDBACK",
    });

    res.status(200).json({
      success: true,
      stats: {
        total,
        open,
        assigned,
        underReview,
        resolved,
        closed,
        complaints,
        suggestions,
        productFeedback,
        serviceFeedback,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};