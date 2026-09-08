const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv"); 

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/productRoutes");
const priceRoutes = require("./routes/priceRoutes");
const dailyCashReportRoutes = require("./routes/dailyCashReportRoutes");
const orderRoutes = require("./routes/orderRoutes");
const leadRoutes = require("./routes/leadRoutes");
const qrRoutes = require("./routes/qrRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const financeRoutes = require("./routes/financeRoutes");
const reportRoutes = require("./routes/reportRoutes");
const systemSettingsRoutes = require("./routes/systemSettingsRoutes");
const manufacturingBatchRoutes = require("./routes/manufacturingBatchRoutes");
const batchCostVerificationRoutes = require("./routes/batchCostVerificationRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const stockMovementRoutes = require("./routes/stockMovementRoutes");
const dispatchRoutes = require("./routes/dispatchRoutes");
const inboundMaterialRoutes = require("./routes/inboundMaterialRoutes");
const advanceSalaryRoutes = require("./routes/advanceSalaryRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const commissionRoutes = require("./routes/commissionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const documentRoutes = require("./routes/documentRoutes");
const documentCategoryRoutes = require("./routes/documentCategoryRoutes");
const birthdayRoutes = require("./routes/birthdayRoutes");
const greetingRoutes = require("./routes/greetingRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const loyaltyTierRoutes = require("./routes/loyaltyTierRoutes");
const followUpRoutes = require("./routes/followUpRoutes");
const salesVisitRoutes = require("./routes/salesVisitRoutes");
const bankPaymentRoutes = require("./routes/bankPaymentRoutes");
const approvalRoutes = require("./routes/approvalRoutes");
const contactRoutes = require("./routes/contactRoutes");
const socialMediaRoutes = require("./routes/socialMediaRoutes");


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