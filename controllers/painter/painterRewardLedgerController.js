const RewardTransaction = require("../../models/superadmin/RewardTransaction");

// GET /api/painter/reward-ledger
const getPainterRewardLedger = async (req, res) => {
  try {
    const painterId =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const transactions = await RewardTransaction.find({
      user: painterId,
      userType: "PAINTER",
    })
      .sort({ createdAt: 1 })
      .lean();

    let balance = 0;

    const ledger = transactions.map((transaction) => {
      const points = Number(transaction.points || 0);

      const isCredit =
        transaction.transactionType === "ADD" ||
        transaction.transactionType === "APPROVE" ||
        transaction.transactionType === "RELEASE";

      const isDebit =
        transaction.transactionType === "DEDUCT" ||
        transaction.transactionType === "REVERSE";

      let credit = 0;
      let debit = 0;

      if (isCredit) {
        credit = points;
        balance += points;
      }

      if (isDebit) {
        debit = points;
        balance -= points;
      }

      return {
        _id: transaction._id,
        date: transaction.createdAt,
        reference: transaction.reference || "-",
        type:
          transaction.transactionType === "ADD"
            ? "QR Reward"
            : transaction.transactionType || "-",
        credit,
        debit,
        balance,
      };
    });

    ledger.reverse();

    return res.status(200).json({
      success: true,
      ledger,
    });
  } catch (error) {
    console.error(
      "Get Painter Reward Ledger Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reward ledger",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterRewardLedger,
};