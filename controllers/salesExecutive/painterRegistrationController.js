const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const PainterRegistration = require("../../models/salesExecutive/PainterRegistration");
const User = require("../../models/superadmin/User");

// Generate next User ID
const generateUserId = async () => {
  const lastUser = await User.findOne({
    userId: /^USR\d+$/,
  }).sort({ createdAt: -1 });

  const lastNumber = lastUser
    ? parseInt(lastUser.userId.replace("USR", ""), 10)
    : 0;

  return `USR${String(lastNumber + 1).padStart(3, "0")}`;
};

// Generate registration ID
const generateRegistrationId = () => {
  return `PR-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
};

// Get uploaded file URL
const getFileUrl = (file) => {
  return file ? `/uploads/documents/${file.filename}` : "";
};

// ======================================
// CREATE PAINTER REGISTRATION
// ======================================
exports.createPainterRegistration = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      address,
      city,
      serviceableArea,
      experience,
      specialization,
      bankAccountNumber,
      ifscCode,
    } = req.body;

    if (
      !name ||
      !mobile ||
      !address ||
      !city ||
      !serviceableArea ||
      experience === undefined ||
      experience === "" ||
      !specialization ||
      !bankAccountNumber ||
      !ifscCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required painter details.",
      });
    }

    if (
      !Number.isFinite(Number(experience)) ||
      Number(experience) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience must be a valid non-negative number.",
      });
    }

    if (!mongoose.isValidObjectId(req.user.userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid Sales Executive session.",
      });
    }

    const salesExecutive = await User.findById(req.user.userId);

    if (!salesExecutive || salesExecutive.role !== "SALES_EXECUTIVE") {
      return res.status(403).json({
        success: false,
        message: "Only Sales Executives can register painters.",
      });
    }

    const normalizedMobile = String(mobile).trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    // Check existing User mobile
    const existingUser = await User.findOne({
      mobile: normalizedMobile,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This mobile number is already registered.",
      });
    }

    // Check existing Painter registration
    const existingRegistration = await PainterRegistration.findOne({
      mobile: normalizedMobile,
      status: { $ne: "REJECTED" },
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "A painter registration already exists for this mobile number.",
      });
    }

    // Check email only when provided
    if (normalizedEmail) {
      const existingEmail = await User.findOne({
        email: normalizedEmail,
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "This email is already registered.",
        });
      }

      const existingPainterEmail = await PainterRegistration.findOne({
        email: normalizedEmail,
        status: { $ne: "REJECTED" },
      });

      if (existingPainterEmail) {
        return res.status(409).json({
          success: false,
          message: "A painter registration already exists for this email.",
        });
      }
    }

    const files = req.files || {};

    const aadhaar = getFileUrl(files.aadhaar?.[0]);
    const profilePhoto = getFileUrl(files.profilePhoto?.[0]);
    const panCard = getFileUrl(files.panCard?.[0]);
    const passbook = getFileUrl(files.passbook?.[0]);
    const cancelledCheque = getFileUrl(files.cancelledCheque?.[0]);

    if (!aadhaar || !profilePhoto) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar and Profile Photo are required.",
      });
    }

    if (!passbook && !cancelledCheque) {
      return res.status(400).json({
        success: false,
        message: "Please upload either Passbook or Cancelled Cheque.",
      });
    }

    const registration = await PainterRegistration.create({
      registrationId: generateRegistrationId(),
      salesExecutive: salesExecutive._id,
      name: String(name).trim(),
      mobile: normalizedMobile,
      email: normalizedEmail,
      address: String(address).trim(),
      city: String(city).trim(),
      serviceableArea: String(serviceableArea).trim(),
      experience: Number(experience),
      specialization: String(specialization).trim(),
      aadhaar,
      panCard,
      bankAccountNumber: String(bankAccountNumber).trim(),
      ifscCode: String(ifscCode).trim().toUpperCase(),
      profilePhoto,
      passbook,
      cancelledCheque,
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Painter registration submitted successfully.",
      data: registration,
    });
  } catch (error) {
    console.error("Create Painter Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit painter registration.",
      error: error.message,
    });
  }
};

// ======================================
// GET PAINTER REGISTRATIONS
// ======================================
exports.getPainterRegistrations = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    // Sales Executive sees their own registrations.
    // SUPER_ADMIN can see all registrations.
    if (req.user.role === "SALES_EXECUTIVE") {
      filter.salesExecutive = req.user.userId;
    } else if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these registrations.",
      });
    }

    if (status) {
      const allowedStatuses = [
        "PENDING",
        "KYC_VERIFIED",
        "APPROVED",
        "REJECTED",
        "CORRECTION_REQUIRED",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid registration status.",
        });
      }

      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { name: regex },
        { mobile: regex },
        { email: regex },
        { city: regex },
        { registrationId: regex },
      ];
    }

    const registrations = await PainterRegistration.find(filter)
      .populate("salesExecutive", "name userId email mobile")
      .populate("reviewedBy", "name userId")
      .populate("painterUser", "name userId status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("Get Painter Registrations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch painter registrations.",
      error: error.message,
    });
  }
};

// ======================================
// GET PAINTER REGISTRATION BY ID
// ======================================
exports.getPainterRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID.",
      });
    }

    const registration = await PainterRegistration.findById(id)
      .populate("salesExecutive", "name userId email mobile")
      .populate("reviewedBy", "name userId")
      .populate("painterUser", "name userId status");

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Painter registration not found.",
      });
    }

    if (
      req.user.role === "SALES_EXECUTIVE" &&
      registration.salesExecutive._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this registration.",
      });
    }

    if (
      !["SALES_EXECUTIVE", "SUPER_ADMIN"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this registration.",
      });
    }

    return res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("Get Painter Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch painter registration.",
      error: error.message,
    });
  }
};

// ======================================
// REVIEW / VERIFY / APPROVE / REJECT
// ======================================
exports.reviewPainterRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID.",
      });
    }

    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can approve or reject registrations.",
      });
    }

    const allowedStatuses = [
      "KYC_VERIFIED",
      "APPROVED",
      "REJECTED",
      "CORRECTION_REQUIRED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status.",
      });
    }

    const registration = await PainterRegistration.findById(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Painter registration not found.",
      });
    }

    if (["APPROVED", "REJECTED"].includes(registration.status)) {
      return res.status(400).json({
        success: false,
        message: "This registration has already been finalized.",
      });
    }

    if (status === "APPROVED" && registration.status !== "KYC_VERIFIED") {
      return res.status(400).json({
        success: false,
        message: "Verify KYC before approving this painter.",
      });
    }

    if (
      status === "KYC_VERIFIED" &&
      (
        !registration.aadhaar ||
        !registration.profilePhoto ||
        !registration.bankAccountNumber ||
        !registration.ifscCode ||
        (!registration.passbook && !registration.cancelledCheque)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Required KYC documents or bank details are missing.",
      });
    }

    if (
      ["REJECTED", "CORRECTION_REQUIRED"].includes(status) &&
      !String(remarks || "").trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide remarks for this decision.",
      });
    }

    // Create Painter User account only after approval.
    if (status === "APPROVED" && !registration.painterUser) {
      const existingUser = await User.findOne({
        mobile: registration.mobile,
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "A User account with this mobile number already exists.",
        });
      }

      const userId = await generateUserId();

      // User model requires email, although Painter email is optional.
      // Use an internal placeholder when no email was provided.
      const accountEmail =
        registration.email ||
        `painter.${registration.mobile}@accounts.invalid`;

      const temporaryPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      const painterUser = await User.create({
        name: registration.name,
        userId,
        email: accountEmail,
        mobile: registration.mobile,
        password: hashedPassword,
        profilePicture: registration.profilePhoto,
        address: registration.address,
        city: registration.city,
        role: "PAINTER",
        status: "INACTIVE",
        kycStatus: "APPROVED",
        kyc: {
          aadhaarImage: registration.aadhaar,
          panImage: registration.panCard,
          bankAccountNumber: registration.bankAccountNumber,
          ifscCode: registration.ifscCode,
          cancelledChequeImage:
            registration.cancelledCheque || registration.passbook,
        },
      });

      registration.painterUser = painterUser._id;
    }

    registration.status = status;
    registration.adminRemarks = String(remarks || "").trim();
    registration.reviewedBy = req.user.userId;
    registration.reviewedAt = new Date();

    await registration.save();

    return res.status(200).json({
      success: true,
      message:
        status === "KYC_VERIFIED"
          ? "Painter KYC verified successfully."
          : status === "APPROVED"
          ? "Painter registration approved. Account remains inactive."
          : status === "REJECTED"
          ? "Painter registration rejected."
          : "Painter registration marked for correction.",
      data: registration,
    });
  } catch (error) {
    console.error("Review Painter Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to review painter registration.",
      error: error.message,
    });
  }
};