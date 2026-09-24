const PainterFeedback = require("../../models/painter/PainterFeedback");

const createPainterFeedback = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (req.user.role !== "PAINTER") {
            return res.status(403).json({
                success: false,
                message: "Only painter can submit feedback",
            });
        }

        const painterId =
            req.user._id ||
            req.user.id ||
            req.user.userId;

        if (!painterId) {
            return res.status(401).json({
                success: false,
                message: "Painter ID not found in authentication token",
            });
        }

        const {
            feedbackType,
            title,
            description,
        } = req.body;

        if (!feedbackType) {
            return res.status(400).json({
                success: false,
                message: "Feedback type is required",
            });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required",
            });
        }

        const attachments = req.files
            ? req.files.map(
                  (file) =>
                      `/uploads/painter-feedback/${file.filename}`
              )
            : [];

        const feedback = await PainterFeedback.create({
            painter: painterId,
            feedbackType,
            title: title.trim(),
            description: description?.trim() || "",
            attachments,
            status: "OPEN",
        });

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedback,
        });
    } catch (error) {
        console.error("Create Painter Feedback Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit feedback",
            error: error.message,
        });
    }
};

const getPainterComplaints = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (req.user.role !== "PAINTER") {
            return res.status(403).json({
                success: false,
                message: "Only painter can view complaints",
            });
        }

        const painterId =
            req.user._id ||
            req.user.id ||
            req.user.userId;

        if (!painterId) {
            return res.status(401).json({
                success: false,
                message: "Painter ID not found",
            });
        }

        const complaints = await PainterFeedback.find({
            painter: painterId,
            feedbackType: "COMPLAINT",
        })
            .sort({ createdAt: -1 })
            .select("title feedbackType createdAt status");

        return res.status(200).json({
            success: true,
            complaints,
        });
    } catch (error) {
        console.error("Get Painter Complaints Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch complaints",
            error: error.message,
        });
    }
};

module.exports = {
    createPainterFeedback,
    getPainterComplaints,
};