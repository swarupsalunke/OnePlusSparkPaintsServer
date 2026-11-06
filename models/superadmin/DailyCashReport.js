
const mongoose = require("mongoose");

const paymentModes = ["CASH", "UPI", "CARD", "NET_BANKING", "OTHER"];

const dailyCashReportSchema = new mongoose.Schema(
  {
    // STORE INFORMATION
    reportDate: { type: Date, required: true },
    reportTime: { type: String, required: true },
    shift: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    storeName: { type: String, required: true, trim: true },
    cashierName: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"],
      default: "DRAFT",
    },

    // APPROVAL DETAILS
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    // OPENING CASH BALANCE
    openingCashBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    openingBalanceSource: {
      type: String,
      enum: ["MANUAL", "PREVIOUS_CLOSING"],
      default: "MANUAL",
    },


    // OPENING CASH APPROVAL

    openingBalanceStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "NOT_REQUIRED"],
      default: "PENDING",
    },

    openingBalanceApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    openingBalanceApprovedAt: {
      type: Date,
      default: null,
    },

    openingBalanceRejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    openingBalanceRejectedAt: {
      type: Date,
      default: null,
    },

    openingBalanceRejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    // COLLECTIONS / DIGITAL SETTLEMENT SUMMARY
    collections: {
      cash: { type: Number, default: 0, min: 0 },
      upi: { type: Number, default: 0, min: 0 },
      card: { type: Number, default: 0, min: 0 },
      netBanking: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 },
    },

    // INDIVIDUAL RECEIPTS
    receipts: [
      {
        classification: {
          type: String,
          enum: ["TODAYS_SALE", "OLD_RECOVERY", "CUSTOMER_ADVANCE"],
          required: true,
        },
        customerName: { type: String, trim: true },
        receiptNo: { type: String, trim: true },
        referenceNo: { type: String, trim: true },
        invoiceNo: { type: String, trim: true },
        amount: { type: Number, default: 0, min: 0 },
        paymentMode: {
          type: String,
          enum: paymentModes,
          required: true,
        },
        destinationAccount: { type: String, trim: true },
        remarks: { type: String, trim: true },
      },
    ],

    totalReceipt: { type: Number, default: 0, min: 0 },
    totalCashReceipts: { type: Number, default: 0, min: 0 },
    totalDigitalReceipts: { type: Number, default: 0, min: 0 },

    // CREDIT BILLS - EXISTING FIELD
    creditBills: [
      {
        invoiceNo: { type: String, trim: true },
        customerName: { type: String, trim: true },
        amount: { type: Number, default: 0, min: 0 },
      },
    ],

    // EXPENSES
    expenses: [
      {
        expenseHead: { type: String, trim: true },
        payee: { type: String, trim: true },
        amount: { type: Number, default: 0, min: 0 },
        paymentMode: {
          type: String,
          enum: paymentModes,
          default: "CASH",
        },
        paymentAccount: { type: String, trim: true },
        billAttachment: { type: String, trim: true },
        remarks: { type: String, trim: true },
      },
    ],

    totalExpenses: { type: Number, default: 0, min: 0 },
    totalCashExpenses: { type: Number, default: 0, min: 0 },
    totalDigitalExpenses: { type: Number, default: 0, min: 0 },

    // ADVANCE SALARY
    advanceSalary: [
      {
        employeeName: { type: String, trim: true },
        amount: { type: Number, default: 0, min: 0 },
        paymentMode: {
          type: String,
          enum: paymentModes,
          default: "CASH",
        },
        paymentAccount: { type: String, trim: true },
        reason: { type: String, trim: true },
      },
    ],

    totalAdvanceSalary: { type: Number, default: 0, min: 0 },
    totalDigitalAdvanceSalary: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCashAdvanceSalary: { type: Number, default: 0, min: 0 },

    // CASH TRANSFERS IN
    cashTransfersIn: [
      {
        from: { type: String, trim: true },
        amount: { type: Number, default: 0, min: 0 },
        referenceNo: { type: String, trim: true },
        remarks: { type: String, trim: true },
      },
    ],

    totalCashTransfersIn: { type: Number, default: 0, min: 0 },

    // CASH TRANSFERS OUT
    cashTransfersOut: [
      {
        to: { type: String, trim: true },
        amount: { type: Number, default: 0, min: 0 },
        referenceNo: { type: String, trim: true },
        remarks: { type: String, trim: true },
      },
    ],

    totalCashTransfersOut: { type: Number, default: 0, min: 0 },

    // EXISTING OFFICE TRANSFER FIELD - BACKWARD COMPATIBILITY
    officeTransfer: {
      transferAmount: { type: Number, default: 0, min: 0 },
      transferMode: { type: String, trim: true },
      submittedTo: { type: String, trim: true },
      accountName: { type: String, trim: true },
      referenceNo: { type: String, trim: true },
      remarks: { type: String, trim: true },
    },

    // PURCHASE BILLS
    purchaseBills: [
      {
        vendorName: { type: String, trim: true },
        billNo: { type: String, trim: true },
        amount: { type: Number, default: 0, min: 0 },
        paymentStatus: {
          type: String,
          enum: ["CASH_PAID", "CREDIT", "PARTIAL"],
          default: "CREDIT",
        },
        paidAmount: { type: Number, default: 0, min: 0 },
        paymentMode: {
          type: String,
          enum: paymentModes,
          default: "CASH",
        },
        attachment: { type: String, trim: true },
      },
    ],

    totalPurchaseAmount: { type: Number, default: 0, min: 0 },
    totalCashPurchasePaid: { type: Number, default: 0, min: 0 },
    totalDigitalPurchasePaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    // SALES RETURNS
    salesReturns: [
      {
        returnNo: { type: String, trim: true },
        invoiceNo: { type: String, trim: true },
        customerName: { type: String, trim: true },
        amount: { type: Number, default: 0, min: 0 },
        refundMode: {
          type: String,
          enum: paymentModes,
          default: "CASH",
        },
        referenceNo: { type: String, trim: true },
        remarks: { type: String, trim: true },
      },
    ],

    totalSalesReturn: { type: Number, default: 0, min: 0 },
    totalCashSalesReturn: { type: Number, default: 0, min: 0 },
    totalDigitalSalesReturn: {
      type: Number,
      default: 0,
      min: 0,
    },

    // CASH CLOSING SUMMARY
    closingBalance: { type: Number, default: 0 },

    // DIGITAL SETTLEMENT SUMMARY
    digitalSettlement: {
      totalDigitalReceipts: { type: Number, default: 0, min: 0 },
      totalDigitalPayments: { type: Number, default: 0, min: 0 },
      netDigitalBalance: { type: Number, default: 0 },
    },

    // DOCUMENTS
    documents: [
      {
        fileName: { type: String, trim: true },
        fileUrl: { type: String, trim: true },
      },
    ],

    remarks: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "DailyCashReport",
  dailyCashReportSchema
);
