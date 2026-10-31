const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/superadmin/User");
const Conversation = require("./models/superadmin/Conversation");

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
const salesVisitRoutes = require("./routes/superadmin/salesVisitRoutes");
const bankPaymentRoutes = require("./routes/superadmin/bankPaymentRoutes");
const approvalRoutes = require("./routes/superadmin/approvalRoutes");
const contactRoutes = require("./routes/superadmin/contactRoutes");
const socialMediaRoutes = require("./routes/superadmin/socialMediaRoutes");
const painterCustomerRoutes = require("./routes/painter/painterCustomerRoutes");
const dashboardPreferenceRoutes = require("./routes/superadmin/dashboardPreferenceRoutes");
const supplierVendorRoutes = require("./routes/superadmin/supplierVendorRoutes");
const internalCommunicationRoutes = require("./routes/superadmin/internalCommunicationRoutes");


// painter
const painterDashboardRoutes = require("./routes/painter/dashboardRoutes");
const painterScanRoutes = require("./routes/painter/scanRoutes");
const painterEnquiryRoutes = require("./routes/painter/enquiryRoutes");
const painterProductRoutes = require("./routes/painter/productRoutes");
const painterRewardRoutes = require("./routes/painter/rewardRoutes");
const painterNotificationRoutes = require("./routes/painter/notificationRoutes");
const painterBarcodeScanRoutes = require("./routes/painter/barcodeScanRoutes");
const painterManualCodeRoutes = require("./routes/painter/manualCodeRoutes");
const painterScanHistoryRoutes = require("./routes/painter/scanHistoryRoutes");
const painterProductVerificationRoutes = require("./routes/painter/productVerificationRoutes");
const painterRewardHistoryRoutes = require("./routes/painter/rewardHistoryRoutes");
const painterWalletLedgerRoutes = require("./routes/painter/walletLedgerRoutes");
const painterRewardDashboardRoutes = require("./routes/painter/painterRewardDashboardRoutes");
const painterRewardWalletRoutes = require("./routes/painter/painterRewardWalletRoutes");
const painterRewardLedgerRoutes = require("./routes/painter/painterRewardLedgerRoutes");
const painterRewardTransactionHistoryRoutes = require("./routes/painter/painterRewardTransactionHistoryRoutes");
const painterRewardAnalyticsRoutes = require("./routes/painter/painterRewardAnalyticsRoutes");
const painterSchemePerformanceRoutes = require("./routes/painter/painterSchemePerformanceRoutes");
const painterRedemptionDashboardRoutes = require("./routes/painter/painterRedemptionDashboardRoutes");
const painterRedeemRewardsRoutes = require("./routes/painter/painterRedeemRewardsRoutes");
const painterRedemptionHistoryRoutes = require("./routes/painter/painterRedemptionHistoryRoutes");
const painterRedemptionStatusRoutes = require("./routes/painter/painterRedemptionStatusRoutes");
const painterLoyaltyDashboardRoutes = require("./routes/painter/painterLoyaltyDashboardRoutes");
const painterTierProgressRoutes = require("./routes/painter/painterTierProgressRoutes");
const painterTierBenefitsRoutes = require("./routes/painter/painterTierBenefitsRoutes");
const painterSchemeRoutes = require("./routes/painter/painterSchemeRoutes");
const painterSchemesRoutes = require("./routes/painter/painterSchemesRoutes");
const painterOffersRoutes = require("./routes/painter/painterOffersRoutes");
const painterNotificationsRoutes = require("./routes/painter/painterNotificationRoutes");
const painterReferralRoutes = require("./routes/painter/painterReferralRoutes");
const painterDocumentRoutes = require("./routes/painter/painterDocumentRoutes");
const painterShopEnquiryRoutes = require("./routes/painter/painterShopEnquiryRoutes");
const painterDealerRoutes = require("./routes/painter/painterDealerRoutes");
const painterVoiceVideoRoutes = require("./routes/painter/painterVoiceVideoRoutes");
const painterVoiceImageRoutes = require("./routes/painter/painterVoiceImageRoutes");
const painterFeedbackRoutes = require("./routes/painter/painterFeedbackRoutes");
const painterVoiceHistoryRoutes = require("./routes/painter/painterVoiceHistoryRoutes");
const painterLeadRoutes = require("./routes/painter/painterLeadRoutes");
const painterFollowUpRoutes = require("./routes/painter/painterFollowUpRoutes");
const painterSupportRoutes = require("./routes/painter/painterSupportRoutes");
// const complaintRoutes = require("./routes/painter/complaintRoutes");
const painterComplaintRoutes = require("./routes/painter/complaintRoutes");
const painterProfileRoutes = require("./routes/painter/painterProfileRoutes");
const painterEditProfileRoutes = require("./routes/painter/painterEditProfileRoutes");
const painterBankDetailsRoutes = require("./routes/painter/painterBankDetailsRoutes");
const painterAddressDetailsRoutes = require("./routes/painter/painterAddressDetailsRoutes");
const painterNotificationSettingsRoutes = require("./routes/painter/painterNotificationSettingsRoutes");
const painterChangePasswordRoutes = require("./routes/painter/painterChangePasswordRoutes");
const painterShareProfileRoutes = require("./routes/painter/painterShareProfileRoutes");
const painterProfilePreviewRoutes = require("./routes/painter/painterProfilePreviewRoutes");
const painterAnalyticsRoutes = require("./routes/painter/painterAnalyticsRoutes");

// Dealer
const dealerCartRoutes = require("./routes/dealer/dealerCartRoutes");
const dealerOrderRoutes = require("./routes/dealer/dealerOrderRoutes");
const dealerRewardRedemptionRoutes = require("./routes/dealer/dealerRewardRedemptionRoutes");
const dealerLoyaltyTierRoutes = require("./routes/dealer/dealerLoyaltyTierRoutes");
const dealerPainterEnquiryRoutes = require("./routes/dealer/dealerPainterEnquiryRoutes");
const dealerPaymentOutstandingRoutes = require("./routes/dealer/dealerPaymentOutstandingRoutes");
const dealerPurchaseAnalyticsRoutes = require("./routes/dealer/dealerPurchaseAnalyticsRoutes");
const dealerReferralRoutes = require("./routes/dealer/dealerReferralRoutes");
// const dealerComplaintRoutes = require("./routes/dealer/dealerComplaintRoutes");
const dealerComplaintRoutes = require("./routes/dealer/dealerComplaintRoutes");
const dealerProfileRoutes = require("./routes/dealer/dealerProfileRoutes");

// Sales
const salesExecutiveAttendanceRoutes = require("./routes/salesExecutive/salesExecutiveAttendanceRoutes");
const salesExecutiveBeatRoutes = require("./routes/salesExecutive/salesExecutiveBeatRoutes");
const salesExecutiveLeadRoutes = require("./routes/salesExecutive/salesExecutiveLeadRoutes");
const salesOrderRoutes = require("./routes/salesExecutive/salesOrderRoutes");
const collectionRoutes = require("./routes/salesExecutive/collectionRoutes");
const superAdminCollectionRoutes = require("./routes/superadmin/collectionRoutes");
const dealerRegistrationRoutes = require("./routes/salesExecutive/dealerRegistrationRoutes");
const superAdminDealerRegistrationRoutes = require("./routes/superadmin/dealerRegistrationRoutes");
const painterRegistrationRoutes = require("./routes/salesExecutive/painterRegistrationRoutes");
const superAdminPainterRegistrationRoutes = require("./routes/superadmin/painterRegistrationRoutes");
const salesExecutiveComplaintRoutes = require("./routes/salesExecutive/complaintRoutes");
const painterListRoutes = require("./routes/salesExecutive/painterListRoutes");
const targetRoutes = require("./routes/salesExecutive/targetRoutes");
const followUpRoutes = require("./routes/superadmin/followUpRoutes");
const salesExecutiveFollowUpRoutes = require("./routes/salesExecutive/FollowUpRoutes");
const salesProfileRoutes = require("./routes/salesExecutive/salesProfileRoutes");
const salesExecutiveDashboardRoutes = require("./routes/salesExecutive/dashboardRoutes");




const { startBirthdayReminderService,
} = require("./services/birthdayReminderService");

const path = require("path");
dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "oneplus_spark_super_secret_key";
}

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// SOCKET.IO JWT AUTHENTICATION
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

// SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("User connected:", socket.user.userId);

  // Join personal room
  socket.join(socket.user.userId.toString());

  // JOIN CONVERSATION - WITH ACCESS CHECK
  socket.on("join_conversation", async (conversationId, callback) => {
    const reply = (data) => {
      if (typeof callback === "function") {
        callback(data);
      }
    };

    try {
      if (!mongoose.isValidObjectId(conversationId)) {
        return reply({
          success: false,
          message: "Invalid conversation ID",
        });
      }

      const user = await User.findOne({
        _id: socket.user.userId,
        status: "ACTIVE",
      });

      if (!user) {
        return reply({
          success: false,
          message: "Active user not found",
        });
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        isActive: true,
      });

      if (!conversation) {
        return reply({
          success: false,
          message: "Conversation not found",
        });
      }

      let allowed = false;

      if (user.role === "SUPER_ADMIN") {
        allowed = true;
      } else if (conversation.type === "DIRECT") {
        allowed = conversation.participants.some(
          (id) => id.toString() === user._id.toString()
        );
      } else if (conversation.type === "DEPARTMENT") {
        allowed =
          user.department &&
          user.department.trim().toLowerCase() ===
            conversation.departmentKey;
      }

      if (!allowed) {
        return reply({
          success: false,
          message: "You do not have access to this conversation",
        });
      }

      socket.join(conversationId.toString());

      return reply({
        success: true,
        message: "Conversation joined successfully",
      });
    } catch (error) {
      console.error("Join conversation error:", error);

      return reply({
        success: false,
        message: "Unable to join conversation",
      });
    }
  });

  // LEAVE CONVERSATION
  socket.on("leave_conversation", (conversationId) => {
    if (mongoose.isValidObjectId(conversationId)) {
      socket.leave(conversationId.toString());
    }
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.userId);
  });
});



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
app.use("/api/dashboard-preferences", dashboardPreferenceRoutes);
app.use("/api/suppliers-vendors", supplierVendorRoutes);
app.use("/api/internal-communication", internalCommunicationRoutes);

// painter
app.use("/api/painter", painterDashboardRoutes);
app.use("/api/painter", painterScanRoutes);
app.use("/api/painter", painterEnquiryRoutes);
app.use("/api/painter/products", painterProductRoutes);
app.use("/api/painter/rewards", painterRewardRoutes);
app.use("/api/painter/notifications", painterNotificationRoutes);
app.use("/api/painter/barcode-scan", painterBarcodeScanRoutes);
app.use("/api/painter/manual-code", painterManualCodeRoutes);
app.use("/api/painter/scan-history", painterScanHistoryRoutes);
app.use("/api/painter/product-verification", painterProductVerificationRoutes);
app.use("/api/painter/reward-history", painterRewardHistoryRoutes);
app.use("/api/painter/wallet-ledger", painterWalletLedgerRoutes);
app.use("/api/painter/reward-dashboard", painterRewardDashboardRoutes);
app.use("/api/painter/reward-wallet", painterRewardWalletRoutes);
app.use("/api/painter/reward-ledger", painterRewardLedgerRoutes);
app.use("/api/painter/reward-transaction-history", painterRewardTransactionHistoryRoutes);
app.use("/api/painter/reward-analytics", painterRewardAnalyticsRoutes);
app.use("/api/painter/scheme-performance", painterSchemePerformanceRoutes);
app.use("/api/painter/redemption-dashboard", painterRedemptionDashboardRoutes);
app.use("/api/painter/redeem-rewards", painterRedeemRewardsRoutes);
app.use("/api/painter/redemption-history", painterRedemptionHistoryRoutes);
app.use("/api/painter/redemption-status", painterRedemptionStatusRoutes);
app.use("/api/painter/loyalty-dashboard", painterLoyaltyDashboardRoutes);
app.use("/api/painter/tier-progress", painterTierProgressRoutes);
app.use("/api/painter/tier-benefits", painterTierBenefitsRoutes);
app.use("/api/painter/schemes", painterSchemeRoutes);
app.use("/api/painter/schemes", painterSchemesRoutes);
app.use("/api/painter/offers", painterOffersRoutes);
app.use("/api/painter/notifications", painterNotificationsRoutes);
app.use("/api/painter/referrals", painterReferralRoutes);
app.use("/api/painter/documents", painterDocumentRoutes);
app.use("/api/painter", painterShopEnquiryRoutes);
app.use("/api/painter", painterDealerRoutes);
app.use("/api/painter", painterVoiceVideoRoutes);
app.use("/api/painter", painterVoiceImageRoutes);
// app.use("/api/painter/complaints", complaintRoutes);
app.use("/api/painter/complaints", painterComplaintRoutes);
app.use("/api/painter", painterFeedbackRoutes);
app.use("/api/painter", painterVoiceHistoryRoutes);
app.use("/api/painter/customers", painterCustomerRoutes);
app.use("/api/painter/leads", painterLeadRoutes);
app.use("/api/painter/follow-ups", painterFollowUpRoutes);
app.use("/api/painter/support", painterSupportRoutes);
app.use("/api/painter/profile", painterProfileRoutes);
app.use("/api/painter/profile/edit", painterEditProfileRoutes);
app.use("/api/painter/bank-details", painterBankDetailsRoutes);
app.use("/api/painter/address-details", painterAddressDetailsRoutes);
app.use("/api/painter/notification-settings", painterNotificationSettingsRoutes);
app.use("/api/painter/change-password", painterChangePasswordRoutes);
app.use("/api/painter/profile/share", painterShareProfileRoutes);
app.use("/api/painter/profile/preview", painterProfilePreviewRoutes);
app.use("/api/painter/analytics", painterAnalyticsRoutes);
app.use("/api/painter/analytics", painterAnalyticsRoutes);

// Dealer
app.use("/api/dealer/cart", dealerCartRoutes);
app.use("/api/dealer/orders", dealerOrderRoutes);
app.use("/api/dealer/reward-redemptions", dealerRewardRedemptionRoutes);
app.use("/api/dealer/loyalty-tier", dealerLoyaltyTierRoutes);
app.use("/api/dealer/painter-enquiries", dealerPainterEnquiryRoutes);
app.use("/api/dealer/payment-outstanding", dealerPaymentOutstandingRoutes);
app.use("/api/dealer/purchase-analytics", dealerPurchaseAnalyticsRoutes);
app.use("/api/dealer/referrals", dealerReferralRoutes);
// app.use("/api/dealer/complaints", dealerComplaintRoutes);
app.use("/api/dealer/complaints", dealerComplaintRoutes);
app.use("/api/dealer/profile", dealerProfileRoutes);

// Sales
app.use("/api/sales-executive/attendance", salesExecutiveAttendanceRoutes);
app.use("/api/sales-executive/beat", salesExecutiveBeatRoutes);
app.use("/api/sales-executive/leads", salesExecutiveLeadRoutes);
app.use("/api/sales-executive/orders", salesOrderRoutes);
app.use("/api/sales-executive/collections", collectionRoutes);
app.use("/api/superadmin/collections", superAdminCollectionRoutes);
app.use("/api/sales-executive/dealer-registrations", dealerRegistrationRoutes);
app.use("/api/superadmin/dealer-registrations", superAdminDealerRegistrationRoutes);
app.use("/api/sales-executive/painter-registrations", painterRegistrationRoutes);
app.use("/api/superadmin/painter-registrations", superAdminPainterRegistrationRoutes);
app.use("/api/sales-executive/complaints", salesExecutiveComplaintRoutes);
app.use("/api/sales-executive/painters", painterListRoutes);
app.use("/api/sales-executive/targets", targetRoutes);
app.use("/api/sales-executive/follow-ups", salesExecutiveFollowUpRoutes);
app.use("/api/sales-executive/profile", salesProfileRoutes);
app.use("/api/sales-executive/dashboard", salesExecutiveDashboardRoutes);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "OnePlus Spark CRM/ERP API is running",
  });
});

app.get("/api/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = states[mongoose.connection.readyState] || "unknown";
  res.json({
    success: true,
    status: "ok",
    database: dbState,
  });
});

const PORT = process.env.PORT || 5000;

app.set("io", io);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  startBirthdayReminderService();
});