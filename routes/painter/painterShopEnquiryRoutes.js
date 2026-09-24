const express = require("express");
const router = express.Router();

const {
  createShopEnquiry,
  getShopEnquiries,
  getShopEnquiryById,
} = require("../../controllers/painter/painterShopEnquiryController");

const authMiddleware = require("../../middleware/authMiddleware");

router.post("/shop-enquiries", authMiddleware, createShopEnquiry);

router.get("/shop-enquiries", authMiddleware, getShopEnquiries);

router.get("/shop-enquiries/:id", authMiddleware, getShopEnquiryById);

module.exports = router;