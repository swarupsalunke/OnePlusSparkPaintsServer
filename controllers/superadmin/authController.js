const bcrypt = require("bcryptjs");
const User = require("../../models/superadmin/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const OTP = require("../../models/superadmin/OTP");
const mongoose = require("mongoose");

// 3. Generate a unique User ID
let userId;
let isUnique = false;

while (!isUnique) {
  const lastUser = await User.findOne(
    {},
    { userId: 1 }
  ).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastUser && lastUser.userId) {
    const match = lastUser.userId.match(/^USR(\d+)$/);

    if (match) {
      nextNumber = Number(match[1]) + 1;
    } else {
      nextNumber = Date.now();
    }
  }

  userId = `USR${String(nextNumber).padStart(3, "0")}`;

  const existingId = await User.findOne({ userId });

  if (!existingId) {
    isUnique = true;
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check database connection state
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database connection is not ready. Please try again shortly.",
      });
    }

    // 2. Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Check user status
    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    // 4. Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 5. Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // 6. Update last login
    user.lastLogin = new Date();
    await user.save();

    // 7. Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

const sendForgotPasswordOTP = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Mobile number or email is required",
      });
    }

    // Find user by email OR mobile
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { mobile: identifier },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email or mobile number",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    // Check 45-second resend restriction
    const existingOTP = await OTP.findOne({
      userId: user._id,
      verified: false,
    }).sort({ createdAt: -1 });

    if (existingOTP) {
      const secondsPassed =
        (Date.now() - existingOTP.lastSentAt.getTime()) / 1000;

      if (secondsPassed < 45) {
        const remainingSeconds = Math.ceil(45 - secondsPassed);

        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting another OTP`,
          remainingSeconds,
        });
      }
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // OTP expires after 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Remove old unverified OTPs
    await OTP.deleteMany({
      userId: user._id,
      verified: false,
    });

    // Save new OTP
    await OTP.create({
      userId: user._id,
      otp,
      expiresAt,
      lastSentAt: new Date(),
    });

    // Development only
    console.log("=================================");
    console.log("PASSWORD RESET OTP");
    console.log("User:", user.email);
    console.log("OTP:", otp);
    console.log("Expires:", expiresAt);
    console.log("=================================");

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: 600,
      resendAfter: 45,
    });
  } catch (error) {
    console.error("Send OTP error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email/mobile and OTP are required",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { mobile: identifier },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otpRecord = await OTP.findOne({
      userId: user._id,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or already used",
      });
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Check OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Mark verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Generate short-lived password reset token
    const resetToken = jwt.sign(
      {
        userId: user._id,
        purpose: "PASSWORD_RESET",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Verify OTP error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters, one uppercase letter, one number and one special character",
      });
    }

    // Verify reset token
    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (decoded.purpose !== "PASSWORD_RESET") {
      return res.status(401).json({
        success: false,
        message: "Invalid password reset token",
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent using the current password again
    const samePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
};