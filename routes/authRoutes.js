const express = require("express");

const {
  registerUser,
  loginUser,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post(
  "/forgot-password/send-otp",
  sendForgotPasswordOTP
);

router.post(
  "/forgot-password/verify-otp",
  verifyForgotPasswordOTP
);

router.post(
  "/forgot-password/reset",
  resetPassword
);


const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed successfully",
    user: req.user,
  });
});


const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
  "/super-admin-test",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Super Admin route accessed successfully",
      user: req.user,
    });
  }
);

module.exports = router;