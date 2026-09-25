const express = require("express");
const router = express.Router();
const { createPainterSupport } = require("../../controllers/painter/painterSupportController");

router.post("/email", createPainterSupport);

module.exports = router;