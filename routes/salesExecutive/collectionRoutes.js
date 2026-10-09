
const express = require("express");
const router = express.Router();

const {
    getOutstandingInvoices,
    createCollection,
    getCollections,
} = require("../../controllers/salesExecutive/collectionController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const upload = require("../../middleware/uploadMiddleware");

// Authentication and Sales Executive role protection
router.use(authMiddleware, roleMiddleware("SALES_EXECUTIVE"));

// GET outstanding invoices
router.get("/outstanding-invoices", getOutstandingInvoices);

// CREATE payment entry with file uploads
router.post(
    "/",
    upload.fields([
        { name: "receipt", maxCount: 1 },
        { name: "chequeImage", maxCount: 1 },
        { name: "paymentScreenshot", maxCount: 1 },
    ]),
    createCollection
);

// GET collection history
router.get("/", getCollections);

module.exports = router;
