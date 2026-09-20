const RewardWallet = require("../../models/superadmin/RewardWallet");
const RewardTransaction = require("../../models/superadmin/RewardTransaction");

const getPainterWalletLedger = async (req, res) => {
  try {
    const painterId =
      req.user?._id || req.user?.id || req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const wallet = await RewardWallet.findOne({
      user: painterId,
      userType: "PAINTER",
    });

    const transactions = await RewardTransaction.find({
      user: painterId,
      userType: "PAINTER",
    }).sort({ createdAt: -1 });

    let balancePoints = wallet?.currentPoints || 0;
    let balanceCash = wallet?.currentCashBalance || 0;

    const ledger = transactions.map((transaction) => {
      let points = 0;
      let cash = 0;

      if (transaction.rewardType === "POINTS") {
        points = transaction.transactionType === "DEDUCT"
          ? -(transaction.points || 0)
          : transaction.points || 0;
      }

      if (transaction.rewardType === "CASH") {
        cash = transaction.transactionType === "DEDUCT"
          ? -(transaction.cashAmount || 0)
          : transaction.cashAmount || 0;
      }

      return {
        id: transaction._id,
        date: transaction.createdAt,
        description: transaction.description || "-",
        points,
        cash,
        balance: balancePoints,
      };
    });

    return res.status(200).json({
      success: true,
      summary: {
        currentPoints: wallet?.currentPoints || 0,
        cashBalance: wallet?.currentCashBalance || 0,
        lifetimeEarned: wallet?.lifetimeEarnings || 0,
        redeemed: wallet?.redeemedAmount || 0,
      },
      ledger,
    });
  } catch (error) {
    console.error("Painter wallet ledger error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet ledger",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterWalletLedger,
};