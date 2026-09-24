const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(
    __dirname,
    "../uploads/painter-voice-images"
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
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    ];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    ];

    if (
        allowedTypes.includes(file.mimetype) ||
        allowedExtensions.includes(extension)
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            ),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

module.exports = upload;