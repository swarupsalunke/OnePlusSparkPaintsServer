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
const painterCustomerRoutes = require("./routes/painter/painterCustomerRoutes");

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
const complaintRoutes = require("./routes/painter/complaintRoutes");
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
const dealerComplaintRoutes = require("./routes/dealer/dealerComplaintRoutes");
const dealerProfileRoutes = require("./routes/dealer/dealerProfileRoutes");

// Sales
const salesExecutiveAttendanceRoutes = require("./routes/salesExecutive/salesExecutiveAttendanceRoutes");
const salesExecutiveBeatRoutes = require("./routes/salesExecutive/salesExecutiveBeatRoutes");
const salesExecutiveLeadRoutes = require("./routes/salesExecutive/salesExecutiveLeadRoutes");
const salesOrderRoutes = require("./routes/salesExecutive/salesOrderRoutes");
const collectionRoutes = require("./routes/salesExecutive/collectionRoutes");



const { startBirthdayReminderService,
} = require("./services/birthdayReminderService");

const path = require("path");
dotenv.config();
const app = express();


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
app.use("/api/painter/complaints", complaintRoutes);
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
app.use("/api/dealer/complaints", dealerComplaintRoutes);
app.use("/api/dealer/profile", dealerProfileRoutes);

// Sales
app.use("/api/sales-executive/attendance", salesExecutiveAttendanceRoutes);
app.use("/api/sales-executive/beat", salesExecutiveBeatRoutes);
app.use("/api/sales-executive/leads", salesExecutiveLeadRoutes);
app.use("/api/sales-executive/orders", salesOrderRoutes);
app.use("/api/sales-executive/collections", collectionRoutes);



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