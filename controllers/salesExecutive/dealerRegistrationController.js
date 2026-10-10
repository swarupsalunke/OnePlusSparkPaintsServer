
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const DealerRegistration = require("../../models/salesExecutive/DealerRegistration");
const User = require("../../models/superadmin/User");

// =====================================================
// HELPERS
// =====================================================

const getFileUrl = (file) =>
  file ? `/uploads/documents/${file.filename}` : "";

const getRegistrationFiles = (files = {}) => ({
  gstCertificate: getFileUrl(files.gstCertificate?.[0]),
  panCard: getFileUrl(files.panCard?.[0]),
  aadhaar: getFileUrl(files.aadhaar?.[0]),
  shopPhotograph: getFileUrl(files.shopPhotograph?.[0]),
  businessLicence: getFileUrl(files.businessLicence?.[0]),
  cancelledCheque: getFileUrl(files.cancelledCheque?.[0]),
  bankPassbook: getFileUrl(files.bankPassbook?.[0]),
});

const generateRegistrationId = () =>
  `DR-${Date.now()}-${crypto.randomInt(1000, 10000)}`;

const getCurrentUserId = (req) =>
  req.user?.userId || req.user?.id || req.user?._id;

// =====================================================
// 1. SUBMIT DEALER REGISTRATION
// POST /api/sales-executive/dealer-registrations
// =====================================================

const createDealerRegistration = async (req, res) => {
  try {
    const salesExecutiveId = getCurrentUserId(req);

    if (!salesExecutiveId || !mongoose.isValidObjectId(salesExecutiveId)) {
      return res.status(401).json({
        success: false,
        message: "Valid Sales Executive authentication is required",
      });
    }

    const salesExecutive = await User.findById(salesExecutiveId);

    if (!salesExecutive || salesExecutive.role !== "SALES_EXECUTIVE") {
      return res.status(403).json({
        success: false,
        message: "Only Sales Executives can submit dealer registrations",
      });
    }

    const {
      dealerName,
      businessName,
      mobile,
      email,
      address,
      city,
      district,
      state,
      pinCode,
      gstNumber,
      panNumber,
      businessCategory,
      shopType,
      latitude,
      longitude,
      googleMapLocation,
    } = req.body || {};

    const requiredFields = {
      dealerName,
      businessName,
      mobile,
      email,
      address,
      city,
      district,
      state,
      pinCode,
      businessCategory,
      shopType,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !String(value ?? "").trim())
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
        missingFields,
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedMobile = String(mobile).trim();
    const normalizedGST = String(gstNumber || "").trim().toUpperCase();
    const normalizedPAN = String(panNumber || "").trim().toUpperCase();

    // Prevent duplicate dealer accounts or registrations.
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { mobile: normalizedMobile },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email or mobile number already exists",
      });
    }

    const existingRegistration = await DealerRegistration.findOne({
      $or: [
        { email: normalizedEmail },
        { mobile: normalizedMobile },
      ],
      status: { $ne: "REJECTED" },
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "A registration with this email or mobile already exists",
        registrationId: existingRegistration.registrationId,
        status: existingRegistration.status,
      });
    }

    // Validate optional GPS coordinates.
    let gpsCoordinates = {
      latitude: null,
      longitude: null,
    };

    if (latitude !== undefined && latitude !== "" ||
        longitude !== undefined && longitude !== "") {
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (
        latitude === undefined || latitude === "" ||
        longitude === undefined || longitude === "" ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 || lat > 90 ||
        lng < -180 || lng > 180
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid latitude and longitude",
        });
      }

      gpsCoordinates = {
        latitude: lat,
        longitude: lng,
      };
    }

    const documents = getRegistrationFiles(req.files);

    const registration = await DealerRegistration.create({
      registrationId: generateRegistrationId(),
      salesExecutive: salesExecutive._id,

      dealerName: String(dealerName).trim(),
      businessName: String(businessName).trim(),
      mobile: normalizedMobile,
      email: normalizedEmail,
      address: String(address).trim(),
      city: String(city).trim(),
      district: String(district).trim(),
      state: String(state).trim(),
      pinCode: String(pinCode).trim(),

      gstNumber: normalizedGST,
      panNumber: normalizedPAN,
      businessCategory: String(businessCategory).trim(),
      shopType: String(shopType).trim(),

      ...documents,

      gpsCoordinates,
      googleMapLocation: String(googleMapLocation || "").trim(),

      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Dealer registration submitted successfully",
      registration,
    });
  } catch (error) {
    console.error("CREATE DEALER REGISTRATION ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate registration ID or dealer details",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit dealer registration",
    });
  }
};

// =====================================================
// 2. GET DEALER REGISTRATIONS
// GET /api/sales-executive/dealer-registrations
// GET /api/superadmin/dealer-registrations
// =====================================================

const getDealerRegistrations = async (req, res) => {
  try {
    const role = req.user?.role;
    const userId = getCurrentUserId(req);

    const filter = {};

    if (role === "SALES_EXECUTIVE") {
      if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(401).json({
          success: false,
          message: "Valid user authentication is required",
        });
      }

      filter.salesExecutive = userId;
    } else if (role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these registrations",
      });
    }

    if (req.query.status) {
      const allowedStatuses = [
        "PENDING",
        "KYC_VERIFIED",
        "APPROVED",
        "REJECTED",
        "CORRECTION_REQUIRED",
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid registration status",
        });
      }

      filter.status = req.query.status;
    }

    const registrations = await DealerRegistration.find(filter)
      .populate("salesExecutive", "name userId email mobile")
      .populate("reviewedBy", "name userId role")
      .populate("dealerUser", "name userId email mobile role status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("GET DEALER REGISTRATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dealer registrations",
    });
  }
};

// =====================================================
// 3. GET SINGLE DEALER REGISTRATION
// GET /api/superadmin/dealer-registrations/:id
// =====================================================

const getDealerRegistrationById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID",
      });
    }

    const registration = await DealerRegistration.findById(req.params.id)
      .populate("salesExecutive", "name userId email mobile")
      .populate("reviewedBy", "name userId role")
      .populate("dealerUser", "name userId email mobile role status");

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Dealer registration not found",
      });
    }

    return res.status(200).json({
      success: true,
      registration,
    });
  } catch (error) {
    console.error("GET DEALER REGISTRATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dealer registration",
    });
  }
};

// =====================================================
// 4. ADMIN KYC REVIEW / APPROVAL / REJECTION
// PATCH /api/superadmin/dealer-registrations/:id/review
// =====================================================

const reviewDealerRegistration = async (req, res) => {
  try {
    const adminId = getCurrentUserId(req);

    if (!adminId || !mongoose.isValidObjectId(adminId)) {
      return res.status(401).json({
        success: false,
        message: "Valid Admin authentication is required",
      });
    }

    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can review registrations",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID",
      });
    }

    const { status, remarks = "" } = req.body || {};

    const allowedStatuses = [
      "KYC_VERIFIED",
      "APPROVED",
      "REJECTED",
      "CORRECTION_REQUIRED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status",
      });
    }

    const registration = await DealerRegistration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Dealer registration not found",
      });
    }

    if (registration.status === "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Rejected registration cannot be reviewed again",
      });
    }

    if (registration.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Registration is already approved",
      });
    }

    // KYC must be verified before approval.
    if (status === "APPROVED" && registration.status !== "KYC_VERIFIED") {
      return res.status(400).json({
        success: false,
        message: "Verify KYC first before approving this registration",
      });
    }

    if (status === "KYC_VERIFIED") {
      const requiredDocuments = [
        ["GST Certificate", registration.gstCertificate],
        ["PAN Card", registration.panCard],
        ["Aadhaar", registration.aadhaar],
        ["Shop Photograph", registration.shopPhotograph],
        ["Cancelled Cheque", registration.cancelledCheque],
        ["Bank Passbook", registration.bankPassbook],
      ];

      const missingDocuments = requiredDocuments
        .filter(([, filePath]) => !filePath)
        .map(([documentName]) => documentName);

      if (missingDocuments.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Required KYC documents are missing",
          missingDocuments,
        });
      }
    }

    if (
      ["REJECTED", "CORRECTION_REQUIRED"].includes(status) &&
      !String(remarks).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Remarks are required for rejection or correction",
      });
    }

    // Create User only after KYC verification and approval.
    if (status === "APPROVED") {
      if (registration.dealerUser) {
        return res.status(409).json({
          success: false,
          message: "Dealer account is already linked to this registration",
        });
      }

      const existingUser = await User.findOne({
        $or: [
          { email: registration.email },
          { mobile: registration.mobile },
        ],
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "A user with this email or mobile already exists",
        });
      }

      const lastUser = await User.findOne({}, { userId: 1 })
        .sort({ createdAt: -1 });

      let nextNumber = 1;

      if (lastUser?.userId) {
        const lastNumber = parseInt(
          lastUser.userId.replace("USR", ""),
          10
        );

        if (Number.isInteger(lastNumber) && lastNumber >= 0) {
          nextNumber = lastNumber + 1;
        }
      }

      const userId = `USR${String(nextNumber).padStart(3, "0")}`;

      // Generate an unknown random password.
      // Dealer must set their own password through a secure setup flow.
      const temporaryPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      const dealerUser = await User.create({
        name: registration.dealerName,
        userId,
        email: registration.email,
        mobile: registration.mobile,
        password: hashedPassword,
        role: "DEALER",

        address: registration.address,
        addressLine1: registration.address,
        city: registration.city,
        district: registration.district,
        state: registration.state,
        pinCode: registration.pinCode,
        country: "India",

        // Keep inactive until the dealer completes password setup.
        status: "INACTIVE",
        kycStatus: "APPROVED",

        kyc: {
          gstNumber: registration.gstNumber,
          panNumber: registration.panNumber,
          panImage: registration.panCard,
          aadhaarImage: registration.aadhaar,
          cancelledChequeImage: registration.cancelledCheque,
          shopActLicenceNumber: "",
        },

        notes: `Business: ${registration.businessName}. Category: ${registration.businessCategory}. Shop Type: ${registration.shopType}.`,
      });

      registration.dealerUser = dealerUser._id;
    }

    registration.status = status;
    registration.adminRemarks = String(remarks).trim();
    registration.reviewedBy = admin._id;
    registration.reviewedAt = new Date();

    await registration.save();

    return res.status(200).json({
      success: true,
      message:
        status === "APPROVED"
          ? "Registration approved and dealer account created. Account remains inactive until password setup."
          : status === "KYC_VERIFIED"
          ? "KYC verified successfully"
          : status === "REJECTED"
          ? "Dealer registration rejected"
          : status === "CORRECTION_REQUIRED"
          ? "Registration returned for correction"
          : "Registration reviewed successfully",
      registration,
    });
  } catch (error) {
    console.error("REVIEW DEALER REGISTRATION ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate user ID, email, or mobile number",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to review dealer registration",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createDealerRegistration,
  getDealerRegistrations,
  getDealerRegistrationById,
  reviewDealerRegistration,
};
