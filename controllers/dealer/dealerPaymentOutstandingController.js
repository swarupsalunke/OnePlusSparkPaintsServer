const FinanceTransaction = require("../../models/superadmin/financeTransactionModel");

const getDealerPaymentOutstanding = async (req, res) => {
  try {
    const dealerId =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId;

    if (!dealerId) {
      return res.status(401).json({
        success: false,
        message: "Dealer authentication required",
      });
    }

    const transactions = await FinanceTransaction.find({
      assignedTo: dealerId,
      type: {
        $in: [
          "INVOICE",
          "PAYMENT_RECEIVED",
          "OUTSTANDING",
          "PENDING_PAYMENT",
          "CREDIT_BALANCE",
        ],
      },
    }).sort({ date: -1 });

    const invoices = transactions.filter(
      (item) => item.type === "INVOICE"
    );

    const payments = transactions.filter(
      (item) => item.type === "PAYMENT_RECEIVED"
    );

    const outstanding = transactions.filter(
      (item) =>
        item.type === "OUTSTANDING" ||
        item.type === "PENDING_PAYMENT"
    );

    const creditTransactions = transactions.filter(
      (item) => item.type === "CREDIT_BALANCE"
    );

    const totalInvoiceAmount = invoices.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalPayments = payments.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalOutstanding = outstanding.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalCreditBalance = creditTransactions.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    return res.status(200).json({
      success: true,

      summary: {
        totalInvoiceAmount,
        totalPayments,
        totalOutstanding,
        totalCreditBalance,
        invoiceCount: invoices.length,
        paymentCount: payments.length,
        outstandingCount: outstanding.length,
      },

      invoices,
      payments,
      outstanding,
      creditTransactions,
      transactions,
    });
  } catch (error) {
    console.error(
      "Get dealer payment outstanding error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment and outstanding data",
      error: error.message,
    });
  }
};

module.exports = {
  getDealerPaymentOutstanding,
};