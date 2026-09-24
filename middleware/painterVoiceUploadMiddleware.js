const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(
    __dirname,
    "../uploads/painter-voice"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "video/mp4",
        "video/quicktime",
    ];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const allowedExtensions = [
        ".mp4",
        ".mov",
    ];

    if (
        allowedTypes.includes(file.mimetype) ||
        allowedExtensions.includes(extension)
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only MP4 and MOV video files are allowed."
            ),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});

module.exports = upload;