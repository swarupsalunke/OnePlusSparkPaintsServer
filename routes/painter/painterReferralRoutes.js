const express = require("express");

const {
    getReferralDashboard,
    createReferral,
    getShareReferral,
    getReferralHistory,
} = require("../../controllers/painter/painterReferralController");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("PAINTER"),
    getReferralDashboard
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("PAINTER"),
    createReferral
);

router.get(
    "/share",
    authMiddleware,
    roleMiddleware("PAINTER"),
    getShareReferral
);

router.get(
    "/history",
    authMiddleware,
    roleMiddleware("PAINTER"),
    getReferralHistory
);

module.exports = router;