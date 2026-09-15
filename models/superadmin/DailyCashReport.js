const mongoose = require("mongoose");

const dailyCashReportSchema = new mongoose.Schema(
  {
    // ==========================================
    // STORE INFORMATION
    // ==========================================

    reportDate: {
      type: Date,
      required: true,
    },

    reportTime: {
      type: String,
      required: true,
    },

    shift: {
      type: String,
      required: true,
      trim: true,
    },

    branch: {
      type: String,
      required: true,
      trim: true,
    },

    storeName: {
      type: String,
      required: true,
      trim: true,
    },

    cashierName: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "APPROVED"],
      default: "DRAFT",
    },

    // ==========================================
    // OPENING BALANCE
    // ==========================================

    openingCashBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    openingOnlineBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // COLLECTIONS / RECEIPTS
    // ==========================================

    collections: {
      cash: {
        type: Number,
        default: 0,
        min: 0,
      },

      upi: {
        type: Number,
        default: 0,
        min: 0,
      },

      card: {
        type: Number,
        default: 0,
        min: 0,
      },

      netBanking: {
        type: Number,
        default: 0,
        min: 0,
      },

      other: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    totalReceipt: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // CREDIT BILLS
    // ==========================================

    creditBills: [
      {
        invoiceNo: {
          type: String,
          trim: true,
        },

        customerName: {
          type: String,
          trim: true,
        },

        amount: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    // ==========================================
    // EXPENSES
    // ==========================================

    expenses: [
      {
        expenseHead: {
          type: String,
          trim: true,
        },

        amount: {
          type: Number,
          default: 0,
          min: 0,
        },

        remarks: {
          type: String,
          trim: true,
        },
      },
    ],

    totalExpenses: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // ADVANCE SALARY
    // ==========================================

    advanceSalary: [
      {
        employeeName: {
          type: String,
          trim: true,
        },

        amount: {
          type: Number,
          default: 0,
          min: 0,
        },

        reason: {
          type: String,
          trim: true,
        },
      },
    ],

    totalAdvanceSalary: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // OFFICE TRANSFER / BALANCE SUBMISSION
    // ==========================================

    officeTransfer: {
      transferAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      transferMode: {
        type: String,
        trim: true,
      },

      submittedTo: {
        type: String,
        trim: true,
      },

      accountName: {
        type: String,
        trim: true,
      },

      referenceNo: {
        type: String,
        trim: true,
      },

      remarks: {
        type: String,
        trim: true,
      },
    },

    // ==========================================
    // PURCHASE BILLS
    // ==========================================

    purchaseBills: [
      {
        vendorName: {
          type: String,
          trim: true,
        },

        billNo: {
          type: String,
          trim: true,
        },

        amount: {
          type: Number,
          default: 0,
          min: 0,
        },

        attachment: {
          type: String,
          trim: true,
        },
      },
    ],

    totalPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // CLOSING BALANCE
    // ==========================================

    closingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // DOCUMENTS
    // ==========================================

    documents: [
      {
        fileName: {
          type: String,
          trim: true,
        },

        fileUrl: {
          type: String,
          trim: true,
        },
      },
    ],

    // ==========================================
    // REMARKS
    // ==========================================

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "DailyCashReport",
  dailyCashReportSchema
);