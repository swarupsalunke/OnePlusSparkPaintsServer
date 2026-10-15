const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const dns = require("dns");
try { 
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  dns.setDefaultResultOrder("ipv4first"); 
} catch (e) {}
dotenv.config();

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
const ApprovalRequest = require("./models/approvalRequest");
const BankPayment = require("./models/bankPayment");
const RewardWallet = require("./models/RewardWallet");
const RewardTransaction = require("./models/RewardTransaction");
const Visit = require("./models/Visit");
const FollowUp = require("./models/FollowUp");
const FinanceTransaction = require("./models/financeTransactionModel");
const Leave = require("./models/leaveModel");
const AdvanceSalary = require("./models/advanceSalaryModel");
const Commission = require("./models/commissionModel");
const Report = require("./models/Report");
const ScheduledReport = require("./models/ScheduledReport");
const Feedback = require("./models/feedbackModel");
const Birthday = require("./models/birthdayModel");
const Greeting = require("./models/greetingModel");
const Territory = require("./models/Territory");
const Beat = require("./models/Beat");
const Route = require("./models/Route");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://guruteckinfo_db_user:SMykXD9yFHv0KkDd@one-plus-spark.k1zid2i.mongodb.net/oneplus_spark?retryWrites=true&w=majority";

async function migrateData() {
  console.log("Connecting to MongoDB Atlas...");
  console.log("URI:", MONGO_URI.replace(/:([^@]+)@/, ":****@"));
  
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    tls: true,
    tlsAllowInvalidCertificates: true
  });
  console.log("Connected to MongoDB Atlas successfully!");

  console.log("Clearing existing Atlas collections before fresh migration...");
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Price.deleteMany({}),
    Lead.deleteMany({}),
    Order.deleteMany({}),
    DailyCashReport.deleteMany({}),
    Employee.deleteMany({}),
    Scheme.deleteMany({}),
    LoyaltyTier.deleteMany({}),
    SystemSettings.deleteMany({}),
    DocumentCategory.deleteMany({}),
    Document.deleteMany({}),
    Notification.deleteMany({}),
    InventoryStock.deleteMany({}),
    ManufacturingBatch.deleteMany({}),
    Dispatch.deleteMany({}),
    InboundMaterial.deleteMany({}),
    ApprovalRequest.deleteMany({}),
    BankPayment.deleteMany({}),
    RewardWallet.deleteMany({}),
    RewardTransaction.deleteMany({}),
    Visit.deleteMany({}),
    FollowUp.deleteMany({}),
    FinanceTransaction.deleteMany({}),
    Leave.deleteMany({}),
    AdvanceSalary.deleteMany({}),
    Commission.deleteMany({}),
    Report.deleteMany({}),
    ScheduledReport.deleteMany({}),
    Feedback.deleteMany({}),
    Birthday.deleteMany({}),
    Greeting.deleteMany({}),
    Territory.deleteMany({}),
    Beat.deleteMany({}),
    Route.deleteMany({})
  ]);
  console.log("Cleared existing collections.");

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  // 1. USERS
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
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400001",
      permissions: ["READ", "WRITE", "DELETE", "ADMIN"],
      kycStatus: "APPROVED"
    },
    {
      name: "Rajesh Sharma (Director)",
      userId: "USR002",
      email: "director@gmail.com",
      mobile: "9876543211",
      password: hashedPassword,
      role: "DIRECTOR",
      status: "ACTIVE",
      city: "Pune",
      state: "Maharashtra",
      pinCode: "411001",
      kycStatus: "APPROVED"
    },
    {
      name: "Anjali Gupta (Manager)",
      userId: "USR003",
      email: "manager@gmail.com",
      mobile: "9876543212",
      password: hashedPassword,
      role: "MANAGER",
      status: "ACTIVE",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400002"
    },
    {
      name: "Vikram Singh (Sales Exec)",
      userId: "USR004",
      email: "sales@gmail.com",
      mobile: "9876543213",
      password: hashedPassword,
      role: "SALES_EXECUTIVE",
      status: "ACTIVE",
      city: "Thane",
      state: "Maharashtra",
      pinCode: "400601"
    },
    {
      name: "Meera Nair (Store Cashier)",
      userId: "USR005",
      email: "cashier@gmail.com",
      mobile: "9876543214",
      password: hashedPassword,
      role: "STORE_CASHIER",
      status: "ACTIVE",
      city: "Navi Mumbai",
      state: "Maharashtra",
      pinCode: "400703"
    },
    {
      name: "Apex Paints & Decor (Dealer)",
      userId: "USR006",
      email: "dealer@gmail.com",
      mobile: "9876543215",
      password: hashedPassword,
      role: "DEALER",
      status: "ACTIVE",
      city: "Nashik",
      state: "Maharashtra",
      pinCode: "422001",
      kycStatus: "APPROVED"
    },
    {
      name: "Metro Hardware (Inactive Dealer)",
      userId: "USR007",
      email: "metro.dealer@gmail.com",
      mobile: "9876543217",
      password: hashedPassword,
      role: "DEALER",
      status: "INACTIVE",
      city: "Nagpur",
      state: "Maharashtra",
      pinCode: "440001",
      kycStatus: "PENDING"
    },
    {
      name: "Ramesh Contractor (Active Painter)",
      userId: "USR008",
      email: "painter@gmail.com",
      mobile: "9876543216",
      password: hashedPassword,
      role: "PAINTER",
      status: "ACTIVE",
      city: "Aurangabad",
      state: "Maharashtra",
      pinCode: "431001",
      kycStatus: "APPROVED"
    },
    {
      name: "Suresh Pawar (Blocked Painter)",
      userId: "USR009",
      email: "suresh.painter@gmail.com",
      mobile: "9876543218",
      password: hashedPassword,
      role: "PAINTER",
      status: "BLOCKED",
      city: "Solapur",
      state: "Maharashtra",
      pinCode: "413001",
      kycStatus: "REJECTED"
    }
  ]);
  console.log(`Migrated ${users.length} Users to Atlas.`);

  const adminUser = users[0];
  const salesUser = users[3];
  const activeDealer = users[5];
  const inactiveDealer = users[6];
  const activePainter = users[7];

  // 2. PRODUCTS
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
      productName: "Spark Legacy Gloss Enamel (Discontinued)",
      sku: "PRD-GLOSS-1L",
      barcode: "8901234567895",
      category: "Enamel Paints",
      subCategory: "Gloss Enamel",
      group: "Others",
      brand: "OnePlus Spark",
      packingSize: "1L Can",
      mrp: 350,
      discountPrice: 310,
      stockQuantity: 0,
      status: "INACTIVE"
    }
  ]);
  console.log(`Migrated ${products.length} Products to Atlas.`);

  // 3. PRICES
  await Price.create([
    {
      productName: products[0].productName,
      sku: products[0].sku,
      category: products[0].category,
      brand: products[0].brand,
      packingSize: products[0].packingSize,
      priceListType: "DEALER",
      customerId: activeDealer._id,
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
      productName: products[1].productName,
      sku: products[1].sku,
      category: products[1].category,
      brand: products[1].brand,
      packingSize: products[1].packingSize,
      priceListType: "SEASONAL",
      basePrice: 3500,
      gstPercent: 18,
      discountPercent: 12,
      discountPrice: 3634,
      effectiveDate: new Date("2026-10-01"),
      approvalStatus: "PENDING",
      createdBy: salesUser._id
    },
    {
      productName: products[2].productName,
      sku: products[2].sku,
      category: products[2].category,
      brand: products[2].brand,
      packingSize: products[2].packingSize,
      priceListType: "PROMOTIONAL",
      basePrice: 700,
      gstPercent: 18,
      discountPercent: 25,
      discountPrice: 619,
      effectiveDate: new Date("2026-08-01"),
      approvalStatus: "REJECTED",
      createdBy: salesUser._id,
      rejectionReason: "Discount percentage exceeds authorized threshold (max 15%)."
    }
  ]);

  // 4. LEADS
  await Lead.create([
    { leadNumber: "LD-2026-001", leadName: "Sunil Deshmukh", companyName: "Deshmukh Constructions", mobile: "9822110033", leadSource: "Referral", status: "New", assignedTo: salesUser._id, territory: "Western Region" },
    { leadNumber: "LD-2026-002", leadName: "Karan Johar", companyName: "Karan Interiors", mobile: "9822110044", leadSource: "Website", status: "Follow-up", assignedTo: salesUser._id, territory: "Mumbai Metro" },
    { leadNumber: "LD-2026-003", leadName: "Anand Rathi", companyName: "Rathi Builders", mobile: "9822110055", leadSource: "Trade Show", status: "Qualified", assignedTo: salesUser._id, territory: "Pune Region" },
    { leadNumber: "LD-2026-004", leadName: "Priya Malhotra", companyName: "Malhotra Decorators", mobile: "9822110066", leadSource: "Social Media", status: "Proposal Shared", assignedTo: salesUser._id, territory: "Mumbai Metro" },
    { leadNumber: "LD-2026-005", leadName: "Vijay Mallya", companyName: "Kingfisher Housing", mobile: "9822110077", leadSource: "Walk-in", status: "Converted", assignedTo: salesUser._id, territory: "Western Region" },
    { leadNumber: "LD-2026-006", leadName: "Rohan Kapoor", companyName: "Kapoor Paints Ltd", mobile: "9822110088", leadSource: "Cold Call", status: "Lost", assignedTo: salesUser._id, territory: "Thane Belt" }
  ]);

  // 5. ORDERS
  await Order.create([
    { orderNumber: "ORD-2026-1001", dealer: activeDealer._id, salesExecutive: salesUser._id, orderType: "Dealer Order", items: [{ product: products[0]._id, quantity: 10, price: 5800, total: 58000 }], totalAmount: 58000, status: "New", paymentStatus: "Pending" },
    { orderNumber: "ORD-2026-1002", dealer: activeDealer._id, salesExecutive: salesUser._id, orderType: "Shop Order", items: [{ product: products[1]._id, quantity: 5, price: 3750, total: 18750 }], totalAmount: 18750, status: "Processing", paymentStatus: "Partially Paid" },
    { orderNumber: "ORD-2026-1003", dealer: activeDealer._id, salesExecutive: salesUser._id, orderType: "Dealer Order", items: [{ product: products[2]._id, quantity: 50, price: 820, total: 41000 }], totalAmount: 41000, status: "Approved", paymentStatus: "Paid" },
    { orderNumber: "ORD-2026-1004", dealer: activeDealer._id, salesExecutive: salesUser._id, orderType: "Shop Order", items: [{ product: products[0]._id, quantity: 2, price: 5800, total: 11600 }], totalAmount: 11600, status: "Dispatched", paymentStatus: "Paid" },
    { orderNumber: "ORD-2026-1005", dealer: activeDealer._id, salesExecutive: salesUser._id, orderType: "Dealer Order", items: [{ product: products[1]._id, quantity: 10, price: 3750, total: 37500 }], totalAmount: 37500, status: "Delivered", paymentStatus: "Paid" },
    { orderNumber: "ORD-2026-1006", dealer: inactiveDealer._id, salesExecutive: salesUser._id, orderType: "Dealer Order", items: [{ product: products[0]._id, quantity: 1, price: 5800, total: 5800 }], totalAmount: 5800, status: "Cancelled", paymentStatus: "Refunded" }
  ]);

  // 6. SCHEMES
  await Scheme.create([
    { schemeId: "SCH-2026-01", schemeName: "Monsoon Spark Dhamaka 2026", description: "Earn extra 5% cashback on orders above ₹50,000 during monsoon.", schemeType: "CASHBACK", applicableTo: "DEALERS", startDate: new Date("2026-06-01"), endDate: new Date("2026-09-30"), status: "ACTIVE" },
    { schemeId: "SCH-2026-02", schemeName: "Diwali Spark Bumper Reward", description: "Exclusive reward points multiplier during festive season.", schemeType: "REWARD", applicableTo: "BOTH", startDate: new Date("2026-10-15"), endDate: new Date("2026-11-15"), status: "UPCOMING" },
    { schemeId: "SCH-2026-03", schemeName: "Early Bird Painter Scheme 2025", description: "Special early bird discount on primers and putties.", schemeType: "DISCOUNT", applicableTo: "PAINTERS", startDate: new Date("2025-01-01"), endDate: new Date("2025-12-31"), status: "EXPIRED" },
    { schemeId: "SCH-2026-04", schemeName: "Draft New Year Scheme 2027", description: "Internal draft scheme for upcoming fiscal year.", schemeType: "CASHBACK", applicableTo: "DEALERS", startDate: new Date("2027-01-01"), endDate: new Date("2027-03-31"), status: "DRAFT" }
  ]);

  // 7. EMPLOYEES
  await Employee.create([
    { employeeId: "EMP0001", name: "Sanjay Verma", department: "Sales & Marketing", designation: "Area Sales Manager", email: "sanjay.verma@oneplusspark.com", mobile: "9123456789", location: "Mumbai", employmentType: "PERMANENT", status: "ACTIVE", joiningDate: new Date("2023-05-15") },
    { employeeId: "EMP0002", name: "Pooja Patil", department: "Finance & Accounts", designation: "Senior Accountant", email: "pooja.patil@oneplusspark.com", mobile: "9123456790", location: "Pune", employmentType: "PERMANENT", status: "ON_LEAVE", joiningDate: new Date("2024-02-01") },
    { employeeId: "EMP0003", name: "Amit Deshmukh", department: "Logistics & Warehouse", designation: "Warehouse Executive", email: "amit.deshmukh@oneplusspark.com", mobile: "9123456791", location: "Bhiwandi", employmentType: "CONTRACTUAL", status: "INACTIVE", joiningDate: new Date("2024-06-10") },
    { employeeId: "EMP0004", name: "Neha Joshi", department: "Human Resources", designation: "HR Associate", email: "neha.joshi@oneplusspark.com", mobile: "9123456792", location: "Mumbai", employmentType: "TEMPORARY", status: "RESIGNED", joiningDate: new Date("2022-01-10") }
  ]);

  // 8. APPROVAL WORKFLOW
  await ApprovalRequest.create([
    { requestId: "APR-2026-001", moduleType: "Dealer Registration Approval", requestType: "New Dealer KYC & Account Creation", requestDetails: "Approval requested for Apex Paints & Decor", requestedBy: "Sales Exec Vikram Singh", amount: 0, currentStage: "Maker Approval", status: "Pending", maker: "Manager Anjali Gupta", remarks: "Awaiting initial document verification" },
    { requestId: "APR-2026-002", moduleType: "Product Price Revision", requestType: "Bulk Price Discount Approval", requestDetails: "Special 10% discount on Spark Royale 20L for Apex Paints", requestedBy: "Sales Exec Vikram Singh", amount: 58000, currentStage: "Completed", status: "Approved", maker: "Manager Anjali Gupta", checker: "Director Rajesh Sharma", approvedAt: new Date(), remarks: "Price revision verified and approved." },
    { requestId: "APR-2026-003", moduleType: "Cash Reward Release", requestType: "High Value Reward Release", requestDetails: "Cash reward request for Painter Ramesh Contractor", requestedBy: "Painter Ramesh Contractor", amount: 15000, currentStage: "Checker Approval", status: "Rejected", maker: "Manager Anjali Gupta", checker: "Director Rajesh Sharma", rejectedAt: new Date(), remarks: "Verification failed: insufficient QR scan logs." }
  ]);

  // 9. REWARDS
  await RewardWallet.create([
    { user: activePainter._id, userType: "PAINTER", currentPoints: 1450, currentCashBalance: 2800, lifetimeEarnings: 8500, redeemedAmount: 5700, pendingRewards: 500 },
    { user: activeDealer._id, userType: "DEALER", currentPoints: 6200, currentCashBalance: 12000, lifetimeEarnings: 35000, redeemedAmount: 23000, pendingRewards: 1500 }
  ]);

  await RewardTransaction.create([
    { user: activePainter._id, userType: "PAINTER", rewardType: "POINTS", transactionType: "ADD", points: 500, status: "APPROVED", description: "QR Scan Bonus on Wall Putty Bag", reference: "QR-SCAN-99128" },
    { user: activePainter._id, userType: "PAINTER", rewardType: "CASH", transactionType: "RELEASE", cashAmount: 1000, status: "RELEASED", description: "Bank Transfer Cash Reward Release", reference: "TXN-BANK-5541" },
    { user: activePainter._id, userType: "PAINTER", rewardType: "CASH", transactionType: "APPROVE", cashAmount: 500, status: "PENDING", description: "Cashback Reward Claim", reference: "CLAIM-8821" },
    { user: activePainter._id, userType: "PAINTER", rewardType: "POINTS", transactionType: "REVERSE", points: 100, status: "REVERSED", description: "Duplicate QR Scan Reversal", reference: "REV-QR-001" }
  ]);

  // 10. DISPATCH
  await Dispatch.create([
    { dispatchNumber: "DISP-2026-501", customer: "Apex Paints & Decor", invoice: "INV-2026-101", route: "Mumbai-Nashik Highway", destination: "Nashik Store #1", quantity: 10, unit: "Buckets", driver: "Ganesh Shinde", vehicle: "MH-04-EK-9821", transportMode: "Road Transport", status: "DISPATCHED", remarks: "Driver en route, ETA 4:00 PM." },
    { dispatchNumber: "DISP-2026-502", customer: "Deshmukh Constructions", invoice: "INV-2026-102", route: "Pune Expressway", destination: "Pune Site Office", quantity: 25, unit: "Bags", driver: "Ramesh Pawar", vehicle: "MH-12-AQ-3341", transportMode: "Road Transport", status: "DELIVERED", remarks: "Successfully delivered and acknowledged by client." },
    { dispatchNumber: "DISP-2026-503", customer: "Karan Interiors", invoice: "INV-2026-103", route: "Local Mumbai City", destination: "Andheri West Studio", quantity: 5, unit: "Drums", status: "PENDING", remarks: "Scheduled for tomorrow morning loading." }
  ]);

  // 11. FOLLOW-UPS & VISITS
  await FollowUp.create([
    { customerName: "Metro Hardware (Inactive Dealer)", customerMobile: "9876543217", customerId: "USR007", triggerType: "NO_RECENT_ORDERS", dueDate: new Date("2026-09-20"), priority: "HIGH", assignedTo: "Vikram Singh", status: "PENDING", remarks: "No order recorded for 60 days. Call to re-engage." },
    { customerName: "Ramesh Contractor (Painter)", customerMobile: "9876543216", customerId: "USR008", triggerType: "REWARDS_NOT_REDEEMED", dueDate: new Date("2026-09-18"), priority: "MEDIUM", assignedTo: "Vikram Singh", status: "IN_PROGRESS", remarks: "Notify about accumulated 1,450 reward points." },
    { customerName: "Sunil Deshmukh", customerMobile: "9822110033", triggerType: "REGISTRATION_PENDING", dueDate: new Date("2026-09-10"), priority: "LOW", assignedTo: "Vikram Singh", status: "CLOSED", closedAt: new Date("2026-09-12"), remarks: "Registration completed successfully." }
  ]);

  await Visit.create([
    { visitType: "DEALER", customerName: "Apex Paints & Decor", customerId: "USR006", customerMobile: "9876543215", territory: "Western Region", beat: "Beat #4 - Nashik City", route: "Route A1", visitDate: new Date(), visitTime: "11:00 AM", assignedTo: "Vikram Singh", visitStatus: "COMPLETED", remarks: "Discussed festive season stock requirement." },
    { visitType: "PAINTER", customerName: "Suresh Pawar", customerId: "USR009", customerMobile: "9876543218", territory: "Solapur Zone", visitDate: new Date("2026-09-25"), visitTime: "02:30 PM", assignedTo: "Vikram Singh", visitStatus: "PLANNED", remarks: "Site visit for hotel painting project proposal." }
  ]);

  // 12. FINANCE TRANSACTIONS
  await FinanceTransaction.create([
    { transactionId: "FIN-TXN-101", type: "INVOICE", date: new Date("2026-09-01"), description: "Bulk Emulsion Paint Sale Invoice #101", category: "Sales Revenue", account: "Sales Account", amount: 58000, paymentMode: "BANK_TRANSFER", status: "PAID", invoice: "INV-2026-101" },
    { transactionId: "FIN-TXN-102", type: "OUTSTANDING", date: new Date("2026-09-05"), description: "Pending Dealer Order Balance", category: "Accounts Receivable", account: "Receivables", amount: 18750, paymentMode: "NA", status: "OUTSTANDING", invoice: "INV-2026-102" },
    { transactionId: "FIN-TXN-103", type: "PENDING_PAYMENT", date: new Date("2026-09-10"), description: "Raw Material Pigment Purchase Bill", category: "Vendor Expense", account: "Payables", amount: 45000, paymentMode: "NEFT", status: "PENDING", vendor: "Asian Pigments Ltd" }
  ]);

  // 13. LEAVES, ADVANCE SALARY, COMMISSIONS
  await Leave.create([
    { employee: salesUser._id, leaveType: "Annual Casual Leave", startDate: new Date("2026-10-01"), endDate: new Date("2026-10-05"), reason: "Family function in home town", status: "PENDING", managerApproval: "PENDING", hrApproval: "PENDING" },
    { employee: adminUser._id, leaveType: "Medical Leave", startDate: new Date("2026-08-10"), endDate: new Date("2026-08-12"), reason: "Viral Fever Doctor Prescription", status: "APPROVED", managerApproval: "APPROVED", hrApproval: "APPROVED" }
  ]);

  await AdvanceSalary.create([
    { employee: salesUser._id, requestAmount: 15000, reason: "Medical Emergency Expense", requiredDate: new Date("2026-09-25"), repaymentMethod: "Monthly Deduction (3 Installments)", approvalStatus: "PENDING" }
  ]);

  await Commission.create([
    { user: "Vikram Singh (Sales Exec)", userType: "SALES_EXECUTIVE", branch: "Mumbai Central", territory: "Western Region", schemeSource: "Monsoon Sales Incentive 2026", salesAmount: 580000, rewardPoints: 1000, cashReward: 15000, commissionPercentage: 2.5, penalty: 0, netPayable: 15000, status: "APPROVED", paymentDate: new Date() },
    { user: "Apex Paints & Decor", userType: "DEALER", branch: "Nashik Branch", territory: "Nashik Belt", schemeSource: "Quarterly Target Bonus", salesAmount: 1200000, rewardPoints: 5000, cashReward: 35000, commissionPercentage: 3.0, penalty: 0, netPayable: 35000, status: "UNDER_VERIFICATION" }
  ]);

  // 14. REPORTS
  await Report.create([
    { reportName: "Monthly Sales Performance Report - August 2026", category: "SALES", reportType: "Sales Summary", generatedBy: "Super Admin", format: "PDF", fileName: "Sales_Report_Aug_2026.pdf", downloaded: true },
    { reportName: "Inventory Valuation & Stock Movements Q3", category: "INVENTORY", reportType: "Stock Ledger", generatedBy: "System Automated", format: "EXCEL", fileName: "Inventory_Q3_2026.xlsx", downloaded: false }
  ]);

  await ScheduledReport.create([
    { reportName: "Weekly Dealer Collection & Order Analysis", category: "FINANCE", schedule: "0 8 * * 1", nextRun: new Date("2026-09-20"), recipients: ["director@gmail.com", "manager@gmail.com"], format: "PDF", status: "ACTIVE" }
  ]);

  // 15. BANK PAYMENTS, FEEDBACK, BIRTHDAY, GREETING
  await BankPayment.create([
    { beneficiaryName: "Ramesh Contractor", bankName: "HDFC Bank", accountNumber: "50100293817263", ifscCode: "HDFC0000123", amount: 2800, remarks: "Monthly Painter Reward Cashout Release", paymentType: "Reward Payment" }
  ]);

  await Feedback.create([
    { title: "Superior Coverage of Spark Royale", feedbackType: "PRODUCT_FEEDBACK", painter: "Ramesh Contractor", description: "Spark Royale Emulsion coverage is excellent and shade consistency is perfect.", location: "Aurangabad", status: "RESOLVED", priority: "LOW" },
    { title: "QR Barcode Scanning Delay in Low Light", feedbackType: "COMPLAINT", painter: "Suresh Pawar", description: "Faced camera delay during barcode QR scanning on low light sites.", location: "Solapur", status: "UNDER_REVIEW", priority: "HIGH" }
  ]);

  const bday = await Birthday.create({ name: "Rahul Deshmukh (Store Owner)", userType: "DEALER", dateOfBirth: new Date("1988-09-20"), mobileNumber: "9876543215", location: "Nashik" });
  await Greeting.create({ birthdayId: bday._id, recipientName: bday.name, message: "Wishing our esteemed dealer partner a joyful and prosperous Birthday!", status: "SENT", sentAt: new Date() });

  // 16. TERRITORY, BEAT, ROUTE
  await Territory.create([
    { territoryName: "Western Region", code: "TER-WEST-01", description: "Mumbai, Thane & Nashik Zones" },
    { territoryName: "Pune Region", code: "TER-PUNE-02", description: "Pune City & PCMC Industrial Belt" }
  ]);

  await Beat.create([
    { beatName: "Nashik Retail Beat", code: "BEAT-NSK-01", territory: "Western Region" },
    { beatName: "Thane Industrial Beat", code: "BEAT-THN-02", territory: "Western Region" }
  ]);

  await Route.create([
    { routeName: "Route A1 - Nashik Highway", territory: "Western Region", beat: "Nashik Retail Beat" },
    { routeName: "Route B2 - Eastern Express Highway", territory: "Western Region", beat: "Thane Industrial Beat" }
  ]);

  // 17. SYSTEM SETTINGS & INVENTORY
  await InventoryStock.create([
    { product: products[0]._id, warehouse: "Central Warehouse Bhiwandi", category: products[0].category, group: products[0].group, quantity: 450, unit: "Bucket", reorderLevel: 100, lastMovementDate: new Date(), lastReceivedDate: new Date() }
  ]);

  await SystemSettings.create({
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

  console.log("==========================================");
  console.log("ALL DATA SUCCESSFULLY MIGRATED TO MONGODB ATLAS!");
  console.log("==========================================");

  process.exit(0);
}

migrateData().catch((err) => {
  console.error("Migration to MongoDB Atlas failed:", err);
  process.exit(1);
});
