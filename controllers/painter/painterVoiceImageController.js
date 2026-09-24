const PainterVoiceImage = require("../../models/painter/PainterVoiceImage");

const uploadVoiceImages = async (req, res) => {
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
                message: "Only painters can upload images",
            });
        }

        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Image title is required",
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one image is required",
            });
        }

        const imagePaths = req.files.map(
            (file) =>
                `/uploads/painter-voice-images/${file.filename}`
        );

        const voiceImages = await PainterVoiceImage.create({
            painter: painterId,
            title: title.trim(),
            images: imagePaths,
            status: "OPEN",
        });

        return res.status(201).json({
            success: true,
            message: "Images uploaded successfully",
            voiceImages,
        });
    } catch (error) {
        console.error(
            "Painter voice images upload error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to upload images",
            error: error.message,
        });
    }
};

module.exports = {
    uploadVoiceImages,
};