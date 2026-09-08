const express = require("express");

const router = express.Router();

const uploadProfile = require("../middleware/uploadProfile");

const {
  createUser,
  getUsers,
  getUserById,
  getUserStats,
  updateUser,
  deleteUser,
  submitKyc,
  approveKyc,
  rejectKyc,
  requestKycCorrection,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ==========================================
// CREATE USER
// ==========================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  uploadProfile.single("profilePicture"),
  createUser
);

// ==========================================
// GET ALL USERS
// ==========================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT",
    "SALES_EXECUTIVE"
  ),
  getUsers
);

// ==========================================
// DASHBOARD STATS
// IMPORTANT:
// /stats MUST COME BEFORE /:id
// ==========================================

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  getUserStats
);

// ==========================================
// GET SINGLE USER
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "ACCOUNTANT",
    "SALES_EXECUTIVE"
  ),
  getUserById
);

// ==========================================
// UPDATE USER
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  uploadProfile.single("profilePicture"),
  updateUser
);

// ==========================================
// DELETE USER
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN"
  ),
  deleteUser
);

// ==========================================
// SUBMIT KYC
// ==========================================

router.post(
  "/:id/kyc/submit",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER",
    "SALES_EXECUTIVE",
    "DEALER",
    "PAINTER"
  ),
  submitKyc
);

// ==========================================
// APPROVE KYC
// ==========================================

router.put(
  "/:id/kyc/approve",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  approveKyc
);

// ==========================================
// REJECT KYC
// ==========================================

router.put(
  "/:id/kyc/reject",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  rejectKyc
);

// ==========================================
// REQUEST KYC CORRECTION
// ==========================================

router.put(
  "/:id/kyc/correction",
  authMiddleware,
  roleMiddleware(
    "SUPER_ADMIN",
    "DIRECTOR",
    "MANAGER"
  ),
  requestKycCorrection
);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;