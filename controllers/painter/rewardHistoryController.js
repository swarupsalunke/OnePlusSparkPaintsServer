const RewardTransaction = require("../../models/superadmin/RewardTransaction");
const Product = require("../../models/superadmin/Product");

const getPainterRewardHistory = async (req, res) => {
  try {
    const painterId =
      req.user?._id || req.user?.id || req.user?.userId;

    if (!painterId) {
      return res.status(401).json({
        success: false,
        message: "Painter authentication required",
      });
    }

    const transactions = await RewardTransaction.find({
      user: painterId,
      userType: "PAINTER",
    }).sort({ createdAt: -1 });

    const history = await Promise.all(
      transactions.map(async (transaction) => {
        let product = null;

        if (transaction.reference) {
          product = await Product.findOne({
            barcode: transaction.reference,
          }).select("productName");
        }

        let value = 0;

        if (transaction.rewardType === "POINTS") {
          value = transaction.points || 0;
        } else if (transaction.rewardType === "CASH") {
          value = transaction.cashAmount || 0;
        }

        return {
          id: transaction._id,
          date: transaction.createdAt,
          product: product?.productName || "-",
          type: transaction.rewardType,
          value,
          status: transaction.status,
        };
      })
    );

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Painter reward history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reward history",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterRewardHistory,
};