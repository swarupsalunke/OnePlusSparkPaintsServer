const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");

// Import all models
const User = require("./models/User");
const Product = require("./models/Product");
const Price = require("./models/Price");
const Lead = require("./models/Lead");
const Order = require("./models/Order");
const DailyCashReport = require("./models/DailyCashReport");
const Employee = require("./models/employeeModel");
const Scheme = require("./models/schemeModel");
const LoyaltyTier = require("./models/loyaltyTierModel");
const SystemSettings = require("./models/systemSettingsModel");
const DocumentCategory = require("./models/documentCategoryModel");
const Document = require("./models/documentModel");
const Notification = require("./models/notificationModel");
const InventoryStock = require("./models/InventoryStock");
const ManufacturingBatch = require("./models/ManufacturingBatch");
const Dispatch = require("./models/Dispatch");
const InboundMaterial = require("./models/InboundMaterial");
const Feedback = require("./models/feedbackModel");
const Greeting = require("./models/greetingModel");
const Birthday = require("./models/birthdayModel");
const BankPayment = require("./models/bankPayment");
const ApprovalRequest = require("./models/approvalRequest");
const Contact = require("./models/Contact");
const SocialMediaPost = require("./models/SocialMediaPost");
const Territory = require("./models/Territory");
const Beat = require("./models/Beat");
const Route = require("./models/Route");
const Visit = require("./models/Visit");
const FollowUp = require("./models/FollowUp");
const QR = require("./models/QR");
const QRScanHistory = require("./models/QRScanHistory");
const RewardWallet = require("./models/RewardWallet");
const RewardTransaction = require("./models/RewardTransaction");
const FinanceTransaction = require("./models/financeTransactionModel");
const AdvanceSalary = require("./models/advanceSalaryModel");
const Leave = require("./models/leaveModel");
const Commission = require("./models/commissionModel");

async function seedData() {
  await connectDB();
  console.log("Seeding comprehensive demo data for all fields...");

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  // 1. SEED USERS
  await User.deleteMany({});
  const users = await User.create([
    {
      name: "Super Admin",
      userId: "USR001",
      email: "admin@gmail.com",
      mobile: "9876543210",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      gender: "Male",
      addressLine1: "101 Spark HQ",
      addressLine2: "Industrial Estate",
      city: "Mumbai",
      district: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pinCode: "400001",
      permissions: ["READ", "WRITE", "DELETE", "ADMIN"],
      kycStatus: "APPROVED",
      kyc: {
        aadhaarNumber: "123456789012",
        panNumber: "ABCDE1234F",
        bankAccountNumber: "99887766554433",
        ifscCode: "HDFC0000123"
      }
    },
    {
      name: "Rajesh Sharma",
      userId: "USR002",
      email: "rajesh.director@oneplusspark.com",
      mobile: "9876543211",
      password: hashedPassword,
      role: "DIRECTOR",
      status: "ACTIVE",
      gender: "Male",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      pinCode: "411001",
      permissions: ["READ", "WRITE", "APPROVE"],
      kycStatus: "APPROVED"
    },
    {
      name: "Anjali Gupta",
      userId: "USR003",
      email: "anjali.manager@oneplusspark.com",
      mobile: "9876543212",
      password: hashedPassword,
      role: "MANAGER",
      status: "ACTIVE",
      gender: "Female",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pinCode: "400002",
      permissions: ["READ", "WRITE"],
      kycStatus: "APPROVED"
    },
    {
      name: "Vikram Singh",
      userId: "USR004",
      email: "vikram.sales@oneplusspark.com",
      mobile: "9876543213",
      password: hashedPassword,
      role: "SALES_EXECUTIVE",
      status: "ACTIVE",
      gender: "Male",
      city: "Thane",
      state: "Maharashtra",
      country: "India",
      pinCode: "400601",
      permissions: ["READ"],
      kycStatus: "APPROVED"
    },
    {
      name: "Meera Nair",
      userId: "USR005",
      email: "meera.cashier@oneplusspark.com",
      mobile: "9876543214",
      password: hashedPassword,
      role: "STORE_CASHIER",
      status: "ACTIVE",
      gender: "Female",
      city: "Navi Mumbai",
      state: "Maharashtra",
      country: "India",
      pinCode: "400703",
      permissions: ["READ", "CASHIER"]
    },
    {
      name: "Apex Paints & Decor (Dealer)",
      userId: "USR006",
      email: "apex.dealer@gmail.com",
      mobile: "9876543215",
      password: hashedPassword,
      role: "DEALER",
      status: "ACTIVE",
      city: "Nashik",
      state: "Maharashtra",
      pinCode: "422001",
      kycStatus: "APPROVED",
      kyc: {
        shopActLicenceNumber: "LIC-NSK-9988",
        gstNumber: "27AAACA123411Z5",
        panNumber: "AAACA1234F"
      }
    },
    {
      name: "Ramesh Contractor (Painter)",
      userId: "USR007",
      email: "ramesh.painter@gmail.com",
      mobile: "9876543216",
      password: hashedPassword,
      role: "PAINTER",
      status: "ACTIVE",
      city: "Aurangabad",
      state: "Maharashtra",
      pinCode: "431001",
      kycStatus: "APPROVED"
    }
  ]);
  console.log(`Seeded ${users.length} Users`);

  const adminUser = users[0];
  const salesUser = users[3];
  const dealerUser = users[5];
  const painterUser = users[6];

  // 2. SEED PRODUCTS
  await Product.deleteMany({});
  const products = await Product.create([
    {
      productName: "Spark Royale Interior Emulsion 20L",
      sku: "PRD-ROYALE-20L",
      barcode: "8901234567890",
      category: "Interior Paints",
      subCategory: "Super Premium Emulsion",
      group: "Paints",
      brand: "OnePlus Spark",
      packingSize: "20L Bucket",
      mrp: 6500,
      discountPrice: 5800,
      stockQuantity: 450,
      status: "ACTIVE"
    },
    {
      productName: "Spark Weather Shield Exterior Paint 10L",
      sku: "PRD-WSHIELD-10L",
      barcode: "8901234567891",
      category: "Exterior Paints",
      subCategory: "Weather Resistant",
      group: "Paints",
      brand: "OnePlus Spark",
      packingSize: "10L Bucket",
      mrp: 4200,
      discountPrice: 3750,
      stockQuantity: 320,
      status: "ACTIVE"
    },
    {
      productName: "Spark Smart Wall Putty 40KG",
      sku: "PRD-PUTTY-40KG",
      barcode: "8901234567892",
      category: "Wall Care",
      subCategory: "White Cement Putty",
      group: "Putty & Fillers",
      brand: "OnePlus Spark",
      packingSize: "40KG Bag",
      mrp: 950,
      discountPrice: 820,
      stockQuantity: 1200,
      status: "ACTIVE"
    },
    {
      productName: "Spark Ultra Primer Water-Based 20L",
      sku: "PRD-PRIMER-20L",
      barcode: "8901234567893",
      category: "Primers",
      subCategory: "Interior/Exterior Primer",
      group: "Primers",
      brand: "OnePlus Spark",
      packingSize: "20L Drum",
      mrp: 2800,
      discountPrice: 2400,
      stockQuantity: 600,
      status: "ACTIVE"
    },
    {
      productName: "Spark Synthetic Thinner 5L",
      sku: "PRD-THINNER-5L",
      barcode: "8901234567894",
      category: "Solvents",
      subCategory: "Paint Thinner",
      group: "Thinners",
      brand: "OnePlus Spark",
      packingSize: "5L Can",
      mrp: 750,
      discountPrice: 680,
      stockQuantity: 250,
      status: "ACTIVE"
    }
  ]);
  console.log(`Seeded ${products.length} Products`);

  // 3. SEED PRICES
  await Price.deleteMany({});
  const prices = await Price.create([
    {
      productName: products[0].productName,
      sku: products[0].sku,
      barcode: products[0].barcode,
      category: products[0].category,
      brand: products[0].brand,
      packingSize: products[0].packingSize,
      priceListType: "DEALER",
      customerId: dealerUser._id,
      basePrice: 5000,
      gstPercent: 18,
      discountPercent: 10,
      discountPrice: 5310,
      effectiveDate: new Date("2026-01-01"),
      approvalStatus: "APPROVED",
      createdBy: adminUser._id,
      approvedBy: adminUser._id,
      approvedAt: new Date()
    },
    {
      productName: products[2].productName,
      sku: products[2].sku,
      barcode: products[2].barcode,
      category: products[2].category,
      brand: products[2].brand,
      packingSize: products[2].packingSize,
      priceListType: "PAINTER",
      customerId: painterUser._id,
      basePrice: 750,
      gstPercent: 18,
      discountPercent: 5,
      discountPrice: 840,
      effectiveDate: new Date("2026-01-01"),
      approvalStatus: "APPROVED",
      createdBy: adminUser._id,
      approvedBy: adminUser._id,
      approvedAt: new Date()
    }
  ]);
  console.log(`Seeded ${prices.length} Price Lists`);

  // 4. SEED LEADS
  await Lead.deleteMany({});
  const leads = await Lead.create([
    {
      leadNumber: "LD-2026-001",
      leadName: "Sunil Deshmukh",
      companyName: "Deshmukh Constructions & Infra",
      mobile: "9822110033",
      leadSource: "Referral",
      status: "Qualified",
      assignedTo: salesUser._id,
      territory: "Western Region",
      createdOn: new Date()
    },
    {
      leadNumber: "LD-2026-002",
      leadName: "Karan Johar",
      companyName: "Karan Interiors Studio",
      mobile: "9822110044",
      leadSource: "Website",
      status: "Proposal Shared",
      assignedTo: salesUser._id,
      territory: "Mumbai Metro",
      createdOn: new Date()
    }
  ]);
  console.log(`Seeded ${leads.length} Leads`);

  // 5. SEED ORDERS
  await Order.deleteMany({});
  const orders = await Order.create([
    {
      orderNumber: "ORD-2026-1001",
      orderDate: new Date(),
      dealer: dealerUser._id,
      salesExecutive: salesUser._id,
      orderType: "Dealer Order",
      items: [
        {
          product: products[0]._id,
          quantity: 10,
          price: 5800,
          total: 58000
        },
        {
          product: products[2]._id,
          quantity: 20,
          price: 820,
          total: 16400
        }
      ],
      totalAmount: 74400,
      status: "Approved",
      paymentStatus: "Partially Paid"
    },
    {
      orderNumber: "ORD-2026-1002",
      orderDate: new Date(),
      dealer: dealerUser._id,
      salesExecutive: salesUser._id,
      orderType: "Shop Order",
      items: [
        {
          product: products[1]._id,
          quantity: 5,
          price: 3750,
          total: 18750
        }
      ],
      totalAmount: 18750,
      status: "Dispatched",
      paymentStatus: "Paid"
    }
  ]);
  console.log(`Seeded ${orders.length} Orders`);

  // 6. SEED EMPLOYEES
  await Employee.deleteMany({});
  const employees = await Employee.create([
    {
      employeeId: "EMP0001",
      name: "Sanjay Verma",
      department: "Sales & Marketing",
      designation: "Area Sales Manager",
      email: "sanjay.verma@oneplusspark.com",
      mobile: "9123456789",
      location: "Mumbai",
      employmentType: "PERMANENT",
      status: "ACTIVE",
      joiningDate: new Date("2023-05-15")
    },
    {
      employeeId: "EMP0002",
      name: "Pooja Patil",
      department: "Finance & Accounts",
      designation: "Senior Accountant",
      email: "pooja.patil@oneplusspark.com",
      mobile: "9123456790",
      location: "Pune",
      employmentType: "PERMANENT",
      status: "ACTIVE",
      joiningDate: new Date("2024-02-01")
    }
  ]);
  console.log(`Seeded ${employees.length} Employees`);

  // 7. SEED SCHEMES
  await Scheme.deleteMany({});
  const schemes = await Scheme.create([
    {
      schemeId: "SCH-2026-01",
      schemeName: "Monsoon Spark Dhamaka 2026",
      description: "Earn extra 5% cashback on orders above ₹50,000 during monsoon season.",
      schemeType: "CASHBACK",
      applicableTo: "DEALERS",
      banner: "https://via.placeholder.com/800x400.png?text=Monsoon+Spark+Dhamaka",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-09-30"),
      pdf: "https://via.placeholder.com/document.pdf",
      termsAndConditions: "Applicable only on Emulsion and Weather Shield orders.",
      status: "ACTIVE"
    },
    {
      schemeId: "SCH-2026-02",
      schemeName: "Painter Mega Reward Carnival",
      description: "Scan product QR codes and earn double reward points on Wall Putty bags.",
      schemeType: "REWARD",
      applicableTo: "PAINTERS",
      banner: "https://via.placeholder.com/800x400.png?text=Painter+Reward+Carnival",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      status: "ACTIVE"
    }
  ]);
  console.log(`Seeded ${schemes.length} Schemes`);

  // 8. SEED LOYALTY TIERS
  await LoyaltyTier.deleteMany({});
  const loyaltyTiers = await LoyaltyTier.create([
    {
      tierId: "TIER-01",
      tierName: "Silver Partner",
      minPoints: 0,
      maxPoints: 5000,
      multiplier: 1.0,
      benefits: ["Basic cashback", "Standard support"],
      description: "Entry-level loyalty tier for registered painters & contractors."
    },
    {
      tierId: "TIER-02",
      tierName: "Gold Champion",
      minPoints: 5001,
      maxPoints: 20000,
      multiplier: 1.5,
      benefits: ["1.5x Reward Points", "Priority Dispatch", "Annual Gift Hamper"],
      description: "Mid-tier rewards for high-volume painters."
    },
    {
      tierId: "TIER-03",
      tierName: "Platinum Legend",
      minPoints: 20001,
      maxPoints: 100000,
      multiplier: 2.0,
      benefits: ["2x Points", "VIP Support", "Fully Sponsored Trip"],
      description: "Premium tier for top performing partners."
    }
  ]);
  console.log(`Seeded ${loyaltyTiers.length} Loyalty Tiers`);

  // 9. SEED DAILY CASH REPORT
  await DailyCashReport.deleteMany({});
  const dailyReports = await DailyCashReport.create([
    {
      reportDate: new Date(),
      reportTime: "18:30",
      shift: "Morning",
      branch: "Mumbai Central",
      storeName: "Spark Flagship Store #1",
      cashierName: "Meera Nair",
      status: "APPROVED",
      openingCashBalance: 15000,
      openingOnlineBalance: 45000,
      collections: {
        cash: 25000,
        upi: 38000,
        card: 12000,
        netBanking: 15000,
        other: 0
      },
      totalReceipt: 90000,
      creditBills: [
        { invoiceNo: "INV-8891", customerName: "Spark Builder Corp", amount: 15000 }
      ],
      expenses: [
        { expenseHead: "Store Maintenance & Tea", amount: 850, remarks: "Tea & Snacks" }
      ],
      totalExpenses: 850,
      closingBalance: 149150,
      remarks: "Shift closed smoothly with zero cash mismatch."
    }
  ]);
  console.log(`Seeded ${dailyReports.length} Daily Cash Reports`);

  // 10. SEED INVENTORY STOCK
  await InventoryStock.deleteMany({});
  const inventory = await InventoryStock.create([
    {
      product: products[0]._id,
      warehouseName: "Central Warehouse Bhiwandi",
      batchNumber: "BATCH-2026-A1",
      availableQuantity: 450,
      reservedQuantity: 50,
      damagedQuantity: 2,
      reorderPoint: 100,
      status: "IN_STOCK"
    },
    {
      product: products[2]._id,
      warehouseName: "Central Warehouse Bhiwandi",
      batchNumber: "BATCH-2026-P9",
      availableQuantity: 1200,
      reservedQuantity: 100,
      damagedQuantity: 5,
      reorderPoint: 300,
      status: "IN_STOCK"
    }
  ]);
  console.log(`Seeded ${inventory.length} Inventory Items`);

  // 11. SEED SYSTEM SETTINGS
  await SystemSettings.deleteMany({});
  const settings = await SystemSettings.create({
    companyName: "OnePlus Spark Paints & Chemicals Pvt Ltd",
    contactEmail: "support@oneplusspark.com",
    contactPhone: "+91 22 8877 6655",
    currency: "INR",
    taxRate: 18,
    enableNotifications: true,
    enableSMSAlerts: true,
    theme: "Light",
    timezone: "Asia/Kolkata"
  });
  console.log("Seeded System Settings");

  // 12. SEED DOCUMENT CATEGORIES & DOCUMENTS
  await DocumentCategory.deleteMany({});
  const docCategory = await DocumentCategory.create({
    categoryName: "Tax & Compliance",
    description: "GST Returns, PAN, Shop Act, and Tax Filings"
  });

  await Document.deleteMany({});
  await Document.create({
    title: "GST Certificate 2026",
    documentCategory: docCategory._id,
    fileUrl: "https://via.placeholder.com/gst-certificate.pdf",
    fileType: "application/pdf",
    uploadedBy: adminUser._id,
    description: "Official GST Registration Document"
  });
  console.log("Seeded Document Category & Document");

  // 13. SEED NOTIFICATIONS
  await Notification.deleteMany({});
  await Notification.create([
    {
      user: adminUser._id,
      title: "New Dealer Order Received",
      message: "Order #ORD-2026-1001 of ₹74,400 has been placed by Apex Paints.",
      type: "ORDER",
      isRead: false
    },
    {
      user: salesUser._id,
      title: "Lead Assigned",
      message: "New Lead 'Sunil Deshmukh' has been assigned to you.",
      type: "LEAD",
      isRead: true
    }
  ]);
  console.log("Seeded Notifications");

  // 14. SEED MANUFACTURING BATCHES & DISPATCH
  await ManufacturingBatch.deleteMany({});
  await ManufacturingBatch.create({
    batchNumber: "MFG-2026-088",
    product: products[0]._id,
    plannedQuantity: 1000,
    producedQuantity: 980,
    startDate: new Date("2026-08-01"),
    completionDate: new Date("2026-08-05"),
    status: "COMPLETED",
    costPerUnit: 3200,
    totalBatchCost: 3136000
  });

  await Dispatch.deleteMany({});
  await Dispatch.create({
    dispatchNumber: "DISP-2026-501",
    order: orders[0]._id,
    vehicleNumber: "MH-04-EK-9821",
    driverName: "Ganesh Shinde",
    driverContact: "9819283746",
    dispatchDate: new Date(),
    status: "IN_TRANSIT"
  });

  await InboundMaterial.deleteMany({});
  await InboundMaterial.create({
    inboundNumber: "INB-2026-201",
    vendorName: "Asian Pigments & Resins Ltd",
    materialName: "Titanium Dioxide Powder",
    quantity: 5000,
    unit: "KG",
    totalAmount: 450000,
    receivedDate: new Date(),
    status: "RECEIVED"
  });
  console.log("Seeded Manufacturing, Dispatch, and Inbound Material");

  // 15. SEED FEEDBACK, GREETINGS & BIRTHDAYS
  await Feedback.deleteMany({});
  await Feedback.create({
    user: dealerUser._id,
    rating: 5,
    category: "Product Quality",
    comments: "Spark Royale Emulsion has outstanding coverage and sheen! Customers love it."
  });

  await Birthday.deleteMany({});
  await Birthday.create({
    personName: "Apex Dealer Manager (Rahul Deshmukh)",
    dateOfBirth: new Date("1990-09-15"),
    role: "Dealer Partner",
    mobile: "9876543215",
    email: "apex.dealer@gmail.com"
  });

  console.log("Seeded Feedback and Birthday info");

  console.log("==========================================");
  console.log("All demo data seeded successfully!");
  console.log("==========================================");
}

seedData().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
