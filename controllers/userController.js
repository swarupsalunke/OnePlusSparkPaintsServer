const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Order = require("../models/Order");
const RewardTransaction = require("../models/RewardTransaction");

// ==========================================
// CREATE USER
// POST /api/users
// ==========================================

const createUser = async (req, res) => {
  try {
    const {
      name,
      userId,
      email,
      mobile,
      password,
      role,

      // Personal Details
      dateOfBirth,
      gender,

      // Address Details
      address,
      addressLine1,
      addressLine2,
      country,
      state,
      district,
      city,
      pinCode,

      // Role & Reporting
      reportingTo,
      department,

      // Account Details
      loginType,
      status,

      // Permissions
      permissions,

      // Notes
      notes,

      // Existing KYC support
      kyc,
    } = req.body;

    // ==========================================
    // PROFILE PICTURE
    // ==========================================

    const profilePicture = req.file
      ? `/uploads/profiles/${req.file.filename}`
      : "";

    // ==========================================
    // REQUIRED FIELDS
    // ==========================================

    if (
      !name ||
      !userId ||
      !email ||
      !mobile ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, user ID, email, mobile, password and role are required",
      });
    }

    // ==========================================
    // CHECK EXISTING USER ID
    // ==========================================

    const existingUserId = await User.findOne({
      userId: userId.trim(),
    });

    if (existingUserId) {
      return res.status(409).json({
        success: false,
        message: "User ID already exists",
      });
    }

    // ==========================================
    // CHECK EXISTING EMAIL
    // ==========================================

    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // ==========================================
    // CHECK EXISTING MOBILE
    // ==========================================

    const existingMobile = await User.findOne({
      mobile,
    });

    if (existingMobile) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already exists",
      });
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // ==========================================
    // PARSE PERMISSIONS
    // ==========================================

    let parsedPermissions = [];

    if (permissions) {
      try {
        parsedPermissions =
          Array.isArray(permissions)
            ? permissions
            : JSON.parse(permissions);
      } catch (error) {
        parsedPermissions = [];
      }
    }

    // ==========================================
    // PARSE KYC
    // ==========================================

    let parsedKyc = {};

    if (kyc) {
      try {
        parsedKyc =
          typeof kyc === "string"
            ? JSON.parse(kyc)
            : kyc;
      } catch (error) {
        parsedKyc = {};
      }
    }

    // ==========================================
    // CREATE USER
    // ==========================================

    const user = await User.create({
      name: name.trim(),
      userId: userId.trim(),
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
      role,

      // Profile Picture
      profilePicture,

      // ========================================
      // PERSONAL DETAILS
      // ========================================

      dateOfBirth: dateOfBirth || null,
      gender: gender || "",

      // ========================================
      // ADDRESS DETAILS
      // ========================================

      address: address || "",
      addressLine1: addressLine1 || "",
      addressLine2: addressLine2 || "",
      country: country || "",
      state: state || "",
      district: district || "",
      city: city || "",
      pinCode: pinCode || "",

      // ========================================
      // ROLE & REPORTING
      // ========================================

      reportingTo: reportingTo || "",
      department: department || "",

      // ========================================
      // ACCOUNT DETAILS
      // ========================================

      loginType: loginType || "",
      status: status || "ACTIVE",

      // ========================================
      // PERMISSIONS
      // ========================================

      permissions: parsedPermissions,

      // ========================================
      // NOTES
      // ========================================

      notes: notes || "",

      // ========================================
      // KYC
      // ========================================

      kyc: parsedKyc,
    });

    // ==========================================
    // REMOVE PASSWORD FROM RESPONSE
    // ==========================================

    const userResponse = user.toObject();

    delete userResponse.password;

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error(
      "Create user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL USERS
// GET /api/users
// ==========================================

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// ==========================================
// GET SINGLE USER
// GET /api/users/:id
// ==========================================

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// ==========================================
// UPDATE USER
// PUT /api/users/:id
// ==========================================

const updateUser = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      name,
      userId,
      email,
      mobile,
      role,

      // Personal Details
      dateOfBirth,
      gender,

      // Address Details
      address,
      addressLine1,
      addressLine2,
      country,
      state,
      district,
      city,
      pinCode,

      // Role & Reporting
      reportingTo,
      department,

      // Account Details
      loginType,
      permissions,
      notes,
      status,

      // Existing KYC
      kyc,
      kycStatus,
      kycRemarks,
    } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // CHECK USER ID UNIQUENESS
    // ==========================================

    if (
      userId !== undefined &&
      userId.trim() !== user.userId
    ) {
      const existingUserId = await User.findOne({
        userId: userId.trim(),
        _id: { $ne: id },
      });

      if (existingUserId) {
        return res.status(409).json({
          success: false,
          message: "User ID already exists",
        });
      }

      user.userId = userId.trim();
    }

    // ==========================================
    // CHECK EMAIL UNIQUENESS
    // ==========================================

    if (
      email &&
      email.toLowerCase() !== user.email
    ) {
      const existingEmail = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }

      user.email = email.toLowerCase();
    }

    // ==========================================
    // CHECK MOBILE UNIQUENESS
    // ==========================================

    if (
      mobile &&
      mobile !== user.mobile
    ) {
      const existingMobile = await User.findOne({
        mobile,
        _id: { $ne: id },
      });

      if (existingMobile) {
        return res.status(409).json({
          success: false,
          message: "Mobile number already exists",
        });
      }

      user.mobile = mobile;
    }

    // ==========================================
    // BASIC INFORMATION
    // ==========================================

    if (name !== undefined) {
      user.name = name;
    }

    if (role !== undefined) {
      user.role = role;
    }

    // ==========================================
    // PROFILE PICTURE
    // ==========================================

    if (req.file) {
      user.profilePicture =
        `/uploads/profiles/${req.file.filename}`;
    }

    // ==========================================
    // PERSONAL DETAILS
    // ==========================================

    if (dateOfBirth !== undefined) {
      user.dateOfBirth = dateOfBirth || null;
    }

    if (gender !== undefined) {
      user.gender = gender;
    }

    // ==========================================
    // ADDRESS DETAILS
    // ==========================================

    if (address !== undefined) {
      user.address = address;
    }

    if (addressLine1 !== undefined) {
      user.addressLine1 = addressLine1;
    }

    if (addressLine2 !== undefined) {
      user.addressLine2 = addressLine2;
    }

    if (country !== undefined) {
      user.country = country;
    }

    if (state !== undefined) {
      user.state = state;
    }

    if (district !== undefined) {
      user.district = district;
    }

    if (city !== undefined) {
      user.city = city;
    }

    if (pinCode !== undefined) {
      user.pinCode = pinCode;
    }

    // ==========================================
    // ROLE & REPORTING
    // ==========================================

    if (reportingTo !== undefined) {
      user.reportingTo = reportingTo;
    }

    if (department !== undefined) {
      user.department = department;
    }

    // ==========================================
    // ACCOUNT DETAILS
    // ==========================================

    if (loginType !== undefined) {
      user.loginType = loginType;
    }

    if (status !== undefined) {
      user.status = status;
    }

    // ==========================================
    // PERMISSIONS
    // ==========================================

    if (permissions !== undefined) {
      user.permissions = Array.isArray(permissions)
        ? permissions
        : [];
    }

    // ==========================================
    // NOTES / REMARKS
    // ==========================================

    if (notes !== undefined) {
      user.notes = notes;
    }

    // ==========================================
    // UPDATE KYC
    // ==========================================

    if (kyc !== undefined) {
      user.kyc = {
        ...(user.kyc?.toObject
          ? user.kyc.toObject()
          : user.kyc || {}),
        ...kyc,
      };
    }

    if (kycStatus !== undefined) {
      user.kycStatus = kycStatus;
    }

    if (kycRemarks !== undefined) {
      user.kycRemarks = kycRemarks;
    }

    // ==========================================
    // SAVE USER
    // ==========================================

    await user.save();

    // ==========================================
    // REMOVE PASSWORD FROM RESPONSE
    // ==========================================

    const userResponse = user.toObject();

    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// ==========================================
// DELETE USER
// DELETE /api/users/:id
// ==========================================

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// ==========================================
// SUBMIT KYC
// POST /api/users/:id/kyc/submit
// ==========================================

const submitKyc = async (req, res) => {
  try {
    const userId = req.params.id;

    const {
      aadhaarNumber,
      aadhaarImage,
      panNumber,
      panImage,
      bankAccountNumber,
      ifscCode,
      cancelledChequeImage,
      shopActLicenceNumber,
      gstNumber,
      emergencyContact,
    } = req.body;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // KYC already approved
    if (user.kycStatus === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "KYC is already approved",
      });
    }

    // Update KYC information
    user.kyc = {
      aadhaarNumber: aadhaarNumber || "",
      aadhaarImage: aadhaarImage || "",
      panNumber: panNumber || "",
      panImage: panImage || "",
      bankAccountNumber: bankAccountNumber || "",
      ifscCode: ifscCode || "",
      cancelledChequeImage: cancelledChequeImage || "",
      shopActLicenceNumber:
        shopActLicenceNumber || "",
      gstNumber: gstNumber || "",
      emergencyContact: {
        name: emergencyContact?.name || "",
        mobile: emergencyContact?.mobile || "",
        relation: emergencyContact?.relation || "",
      },
    };

    // KYC goes for review
    user.kycStatus = "PENDING";
    user.kycRemarks = "";

    await user.save();

    const userResponse = user.toObject();

    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "KYC submitted successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Submit KYC error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit KYC",
    });
  }
};

// ==========================================
// APPROVE KYC
// PUT /api/users/:id/kyc/approve
// ==========================================

const approveKyc = async (req, res) => {
  try {
    const userId = req.params.id;

    const { remarks } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // KYC must be pending
    if (user.kycStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending KYC can be approved",
      });
    }

    // Update KYC status
    user.kycStatus = "APPROVED";
    user.kycRemarks = remarks || "KYC approved";

    await user.save();

    const userResponse = user.toObject();

    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "KYC approved successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Approve KYC error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve KYC",
    });
  }
};

// ==========================================
// REJECT KYC
// PUT /api/users/:id/kyc/reject
// ==========================================

const rejectKyc = async (req, res) => {
  try {
    const userId = req.params.id;

    const { remarks } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only pending KYC can be rejected
    if (user.kycStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending KYC can be rejected",
      });
    }

    // Rejection reason required
    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    user.kycStatus = "REJECTED";
    user.kycRemarks = remarks.trim();

    await user.save();

    const userResponse = user.toObject();

    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "KYC rejected successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Reject KYC error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject KYC",
    });
  }
};

// ==========================================
// REQUEST KYC CORRECTION
// PUT /api/users/:id/kyc/correction
// ==========================================

const requestKycCorrection = async (req, res) => {
  try {
    const userId = req.params.id;

    const { remarks } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // KYC should be pending for correction request
    if (user.kycStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending KYC can be sent for correction",
      });
    }

    // Correction reason required
    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        success: false,
        message: "Correction remarks are required",
      });
    }

    user.kycStatus = "CORRECTION_REQUIRED";
    user.kycRemarks = remarks.trim();

    await user.save();

    const userResponse = user.toObject();

    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message:
        "KYC correction requested successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("KYC correction error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to request KYC correction",
    });
  }
};

// ==========================================
// GET USER STATS
// GET /api/users/stats
// ==========================================

const getUserStats = async (req, res) => {
  try {
    // ==========================================
    // BASIC COUNTS
    // ==========================================

    const totalUsers = await User.countDocuments();

    const totalDealers = await User.countDocuments({
      role: "DEALER",
    });

    const totalOrders = await Order.countDocuments();

    // ==========================================
    // TOTAL SALES
    // ==========================================

    const totalSalesResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalSales =
      totalSalesResult[0]?.total || 0;

    // ==========================================
    // SALES OVERVIEW - LAST 7 DAYS
    // ==========================================

    const today = new Date();

    const startDate = new Date();

    startDate.setDate(today.getDate() - 6);

    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();

    endDate.setHours(23, 59, 59, 999);

    const salesData = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$orderDate",
            },
          },

          sales: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // ==========================================
    // CREATE 7 DAYS DATA
    // ==========================================

    const salesOverview = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setDate(today.getDate() - i);

      const dateKey =
        date.toISOString().split("T")[0];

      const found = salesData.find(
        (item) => item._id === dateKey
      );

      salesOverview.push({
        label: date.toLocaleDateString(
          "en-IN",
          {
            weekday: "short",
          }
        ),

        sales: found ? found.sales : 0,
      });
    }

    // ==========================================
    // ORDER STATUS OVERVIEW
    // ==========================================

    const orderStatusData = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          value: {
            $sum: 1,
          },
        },
      },
    ]);

    const orderStatuses = [
      "Draft",
      "New",
      "Processing",
      "Approved",
      "Dispatched",
      "Delivered",
      "Cancelled",
    ];

    const orderStatus = orderStatuses.map(
      (status) => {
        const found = orderStatusData.find(
          (item) => item._id === status
        );

        return {
          label: status,
          value: found ? found.value : 0,
        };
      }
    );

    // ==========================================
    // TOP SELLING PRODUCTS
    // ==========================================

    const topSellingProducts =
      await Order.aggregate([
        {
          $unwind: "$items",
        },

        {
          $group: {
            _id: "$items.product",

            soldUnits: {
              $sum: "$items.quantity",
            },

            revenue: {
              $sum: "$items.total",
            },
          },
        },

        {
          $sort: {
            soldUnits: -1,
          },
        },

        {
          $limit: 5,
        },

        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },

        {
          $unwind: {
            path: "$product",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 0,

            name: {
              $ifNull: [
                "$product.productName",
                "Unknown Product",
              ],
            },

            category: {
              $ifNull: [
                "$product.category",
                "Unknown",
              ],
            },

            soldUnits: 1,

            revenue: 1,
          },
        },
      ]);

    // ==========================================
    // TOP DEALERS
    // ==========================================

    const topDealers = await Order.aggregate([
      {
        $group: {
          _id: "$dealer",

          orders: {
            $sum: 1,
          },

          sales: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $sort: {
          sales: -1,
        },
      },

      {
        $limit: 5,
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "dealer",
        },
      },

      {
        $unwind: {
          path: "$dealer",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,

          name: {
            $ifNull: [
              "$dealer.name",
              "Unknown Dealer",
            ],
          },

          orders: 1,

          sales: 1,
        },
      },
    ]);

    // ==========================================
    // RECENT ACTIVITIES
    // ==========================================

    const recentActivities = await Order.find()
      .populate("dealer", "name")
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

    const formattedActivities =
      recentActivities.map((order) => {
        let title = "Order Activity";
        let description = "";

        switch (order.status) {
          case "New":
            title = "New Order Created";
            description = `${order.orderNumber} created`;
            break;

          case "Processing":
            title = "Order Processing";
            description =
              `${order.orderNumber} is being processed`;
            break;

          case "Approved":
            title = "Order Approved";
            description =
              `${order.orderNumber} approved`;
            break;

          case "Dispatched":
            title = "Order Dispatched";
            description =
              `${order.orderNumber} dispatched`;
            break;

          case "Delivered":
            title = "Order Delivered";
            description =
              `${order.orderNumber} delivered`;
            break;

          case "Cancelled":
            title = "Order Cancelled";
            description =
              `${order.orderNumber} cancelled`;
            break;

          case "Draft":
            title = "Order Draft Created";
            description =
              `${order.orderNumber} saved as draft`;
            break;

          default:
            title = "Order Updated";
            description =
              `${order.orderNumber} updated`;
        }

        return {
          _id: order._id,
          title,
          description,
          time: order.createdAt,
        };
      });

    // ==========================================
    // SYSTEM OVERVIEW
    // ==========================================

    const systemOverview = [
      {
        name: "Database",
        status: "active",
        message: "MongoDB connected",
        icon: "database",
      },

      {
        name: "API Server",
        status: "active",
        message: "API server running",
        icon: "server",
      },

      {
        name: "Order Management",
        status: "active",
        message:
          `${totalOrders} orders available`,
        icon: "server",
      },

      {
        name: "User Management",
        status: "active",
        message:
          `${totalUsers} users registered`,
        icon: "server",
      },
    ];

    // ==========================================
    // TOTAL REWARDS
    // ==========================================

    const totalRewards =
      await RewardTransaction.countDocuments({
        transactionType: "ADD",
      });

    // ==========================================
    // USER STATUS
    // ==========================================

    const activeUsers = await User.countDocuments({
      status: "ACTIVE",
    });

    const inactiveUsers =
      await User.countDocuments({
        status: "INACTIVE",
      });

    // ==========================================
    // KYC
    // ==========================================

    const pendingKyc = await User.countDocuments({
      kycStatus: "PENDING",
    });

    const approvedKyc = await User.countDocuments({
      kycStatus: "APPROVED",
    });

    const rejectedKyc = await User.countDocuments({
      kycStatus: "REJECTED",
    });

    const correctionRequired =
      await User.countDocuments({
        kycStatus: "CORRECTION_REQUIRED",
      });

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalDealers,
        totalOrders,
        totalSales,
        salesOverview,
        orderStatus,
        topSellingProducts,
        topDealers,
        recentActivities: formattedActivities,
        systemOverview,
        totalRewards,
        activeUsers,
        inactiveUsers,

        kyc: {
          pending: pendingKyc,
          approved: approvedKyc,
          rejected: rejectedKyc,
          correctionRequired,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get user stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch user statistics",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  submitKyc,
  approveKyc,
  rejectKyc,
  requestKycCorrection,
  getUserStats,
};