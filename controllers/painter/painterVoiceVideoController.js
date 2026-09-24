const PainterVoiceVideo = require("../../models/painter/PainterVoiceVideo");

const uploadVoiceVideo = async (req, res) => {
    try {
        const painterId =
            req.user?._id ||
            req.user?.id ||
            req.user?.userId;

        if (!painterId) {
            return res.status(401).json({
                success: false,
                message: "Painter authentication required",
            });
        }

        if (req.user?.role !== "PAINTER") {
            return res.status(403).json({
                success: false,
                message: "Only painters can upload videos",
            });
        }

        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Video title is required",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Video file is required",
            });
        }

        const videoPath = `/uploads/painter-voice/${req.file.filename}`;

        const voiceVideo = await PainterVoiceVideo.create({
            painter: painterId,
            title: title.trim(),
            video: videoPath,
            status: "OPEN",
        });

        return res.status(201).json({
            success: true,
            message: "Video uploaded successfully",
            video: voiceVideo,
        });
    } catch (error) {
        console.error(
            "Painter voice video upload error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to upload video",
            error: error.message,
        });
    }
};

module.exports = {
    uploadVoiceVideo,
};