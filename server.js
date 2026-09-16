const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv"); 

const connectDB = require("./config/db");
// superadmin
const authRoutes = require("./routes/superadmin/authRoutes");
const userRoutes = require("./routes/superadmin/userRoutes");
const dashboardRoutes = require("./routes/superadmin/dashboardRoutes");
const productRoutes = require("./routes/superadmin/productRoutes");
const priceRoutes = require("./routes/superadmin/priceRoutes");
const dailyCashReportRoutes = require("./routes/superadmin/dailyCashReportRoutes");
const orderRoutes = require("./routes/superadmin/orderRoutes");
const leadRoutes = require("./routes/superadmin/leadRoutes");
const qrRoutes = require("./routes/superadmin/qrRoutes");
const rewardRoutes = require("./routes/superadmin/rewardRoutes");
const schemeRoutes = require("./routes/superadmin/schemeRoutes");
const financeRoutes = require("./routes/superadmin/financeRoutes");
const reportRoutes = require("./routes/superadmin/reportRoutes");
const systemSettingsRoutes = require("./routes/superadmin/systemSettingsRoutes");
const manufacturingBatchRoutes = require("./routes/superadmin/manufacturingBatchRoutes");
const batchCostVerificationRoutes = require("./routes/superadmin/batchCostVerificationRoutes");
const inventoryRoutes = require("./routes/superadmin/inventoryRoutes");
const stockMovementRoutes = require("./routes/superadmin/stockMovementRoutes");
const dispatchRoutes = require("./routes/superadmin/dispatchRoutes");
const inboundMaterialRoutes = require("./routes/superadmin/inboundMaterialRoutes");
const advanceSalaryRoutes = require("./routes/superadmin/advanceSalaryRoutes");
const leaveRoutes = require("./routes/superadmin/leaveRoutes");
const employeeRoutes = require("./routes/superadmin/employeeRoutes");
const commissionRoutes = require("./routes/superadmin/commissionRoutes");
const notificationRoutes = require("./routes/superadmin/notificationRoutes");
const documentRoutes = require("./routes/superadmin/documentRoutes");
const documentCategoryRoutes = require("./routes/superadmin/documentCategoryRoutes");
const birthdayRoutes = require("./routes/superadmin/birthdayRoutes");
const greetingRoutes = require("./routes/superadmin/greetingRoutes");
const feedbackRoutes = require("./routes/superadmin/feedbackRoutes");
const loyaltyTierRoutes = require("./routes/superadmin/loyaltyTierRoutes");
const followUpRoutes = require("./routes/superadmin/followUpRoutes");
const salesVisitRoutes = require("./routes/superadmin/salesVisitRoutes");
const bankPaymentRoutes = require("./routes/superadmin/bankPaymentRoutes");
const approvalRoutes = require("./routes/superadmin/approvalRoutes");
const contactRoutes = require("./routes/superadmin/contactRoutes");
const socialMediaRoutes = require("./routes/superadmin/socialMediaRoutes");

// painter
const painterDashboardRoutes = require("./routes/painter/dashboardRoutes");
const painterScanRoutes = require("./routes/painter/scanRoutes");
const painterEnquiryRoutes = require("./routes/painter/enquiryRoutes");
const painterProductRoutes = require("./routes/painter/productRoutes");
const painterRewardRoutes = require("./routes/painter/rewardRoutes");
const painterNotificationRoutes = require("./routes/painter/notificationRoutes");


const { startBirthdayReminderService,
} = require("./services/birthdayReminderService");

const path = require("path");
dotenv.config();
const app = express();

app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.use(cors());
app.use(express.json());

connectDB();

// superadmin
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/daily-cash-reports", dailyCashReportRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/system-settings", systemSettingsRoutes);
app.use("/api/manufacturing/batches", manufacturingBatchRoutes);
app.use("/api/manufacturing/cost-verification", batchCostVerificationRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/inventory/movements", stockMovementRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/inbound", inboundMaterialRoutes);
app.use("/api/advance-salary", advanceSalaryRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/hr/employees", employeeRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/document-categories", documentCategoryRoutes);
app.use("/api/birthdays", birthdayRoutes);
app.use("/api/greetings", greetingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/loyalty-tiers", loyaltyTierRoutes);
app.use("/api/follow-ups", followUpRoutes);
app.use("/api/sales-visits", salesVisitRoutes);
app.use("/api/bank-payments", bankPaymentRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/social-media", socialMediaRoutes);

// painter
app.use("/api/painter", painterDashboardRoutes);
app.use("/api/painter", painterScanRoutes);
app.use("/api/painter", painterEnquiryRoutes);
app.use("/api/painter/products", painterProductRoutes);
app.use("/api/painter/rewards", painterRewardRoutes);
app.use("/api/painter/notifications", painterNotificationRoutes);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "OnePlus Spark CRM/ERP API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  startBirthdayReminderService();
});