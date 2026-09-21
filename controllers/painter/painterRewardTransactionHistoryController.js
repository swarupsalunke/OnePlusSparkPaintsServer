const RewardTransaction = require("../../models/superadmin/RewardTransaction");

// GET /api/painter/reward-transaction-history
const getPainterRewardTransactionHistory = async (req, res) => {
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
      .sort({ createdAt: -1 })
      .lean();

    const history = transactions.map((transaction) => {
      let amount = 0;

      if (transaction.rewardType === "POINTS") {
        amount = Number(transaction.points || 0);
      } else if (transaction.rewardType === "CASH") {
        amount = Number(transaction.cashAmount || 0);
      }

      if (
        transaction.transactionType === "DEDUCT" ||
        transaction.transactionType === "REVERSE"
      ) {
        amount = -Math.abs(amount);
      }

      return {
        _id: transaction._id,
        transaction: transaction.reference || "-",
        date: transaction.createdAt,
        rewardType:
          transaction.rewardType === "POINTS"
            ? "Points"
            : transaction.rewardType === "CASH"
            ? "Cash"
            : transaction.rewardType || "-",
        amount,
        status: transaction.status || "-",
      };
    });

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error(
      "Get Painter Reward Transaction History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reward transaction history",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterRewardTransactionHistory,
};