const express = require("express");

const {
    createOrderReturn,
    getOrderReturns,
    updateReturnStatus,
} = require("../../controllers/superadmin/orderReturnController");

const router = express.Router();

router.post("/", createOrderReturn);

router.get("/", getOrderReturns);

router.patch("/:id/status", updateReturnStatus);

module.exports = router;