const PainterVoiceVideo = require("../../models/painter/PainterVoiceVideo");
const PainterVoiceImage = require("../../models/painter/PainterVoiceImage");
const PainterFeedback = require("../../models/painter/PainterFeedback");

const getPainterVoiceHistory = async (req, res) => {
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
                message: "Only painter can view history",
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

        const [videos, images, feedbacks] = await Promise.all([
            PainterVoiceVideo.find({
                painter: painterId,
            })
                .select("title status createdAt")
                .lean(),

            PainterVoiceImage.find({
                painter: painterId,
            })
                .select("title status createdAt")
                .lean(),

            PainterFeedback.find({
                painter: painterId,
            })
                .select("title feedbackType status createdAt")
                .lean(),
        ]);

        const videoHistory = videos.map((item) => ({
            _id: item._id,
            submission: item.title,
            type: "Video",
            date: item.createdAt,
            status: item.status,
            reward: null,
        }));

        const imageHistory = images.map((item) => ({
            _id: item._id,
            submission: item.title,
            type: "Images",
            date: item.createdAt,
            status: item.status,
            reward: null,
        }));

        const feedbackHistory = feedbacks.map((item) => ({
            _id: item._id,
            submission: item.title,
            type: item.feedbackType,
            date: item.createdAt,
            status: item.status,
            reward: null,
        }));

        const history = [
            ...videoHistory,
            ...imageHistory,
            ...feedbackHistory,
        ].sort(
            (a, b) =>
                new Date(b.date) - new Date(a.date)
        );

        return res.status(200).json({
            success: true,
            history,
        });
    } catch (error) {
        console.error(
            "Get Painter Voice History Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch submission history",
            error: error.message,
        });
    }
};

module.exports = {
    getPainterVoiceHistory,
};