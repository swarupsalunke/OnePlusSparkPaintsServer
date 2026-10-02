const DealerOrder = require("../../models/dealer/DealerOrder");
const RewardTransaction = require("../../models/superadmin/RewardTransaction");
const RewardWallet = require("../../models/superadmin/RewardWallet");

const getDealerPurchaseAnalytics = async (req, res) => {
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

    const orders = await DealerOrder.find({
      dealer: dealerId,
      status: { $ne: "Cancelled" },
    }).sort({ createdAt: -1 });

    const totalPurchase = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    );

    const currentYear = new Date().getFullYear();

    const annualPurchase = orders
      .filter(
        (order) =>
          new Date(order.createdAt).getFullYear() === currentYear
      )
      .reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0
      );

    const monthlyPurchase = orders
      .filter((order) => {
        const date = new Date(order.createdAt);
        const now = new Date();

        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth()
        );
      })
      .reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0
      );

    const productWisePurchase = {};

    const categoryWisePurchase = {};

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const productName = item.productName || "Unknown Product";
        const amount =
          Number(item.total || 0) ||
          Number(item.price || 0) * Number(item.quantity || 0);

        productWisePurchase[productName] =
          (productWisePurchase[productName] || 0) + amount;
      });
    });

    const rewardTransactions = await RewardTransaction.find({
      userId: dealerId,
      userType: "DEALER",
    }).sort({ createdAt: -1 });

    const rewardPointsEarned = rewardTransactions
      .filter((item) => Number(item.points || 0) > 0)
      .reduce(
        (sum, item) => sum + Number(item.points || 0),
        0
      );

    const cashbackEarned = rewardTransactions
      .reduce(
        (sum, item) => sum + Number(item.cashAmount || 0),
        0
      );

    return res.status(200).json({
      success: true,

      summary: {
        monthlyPurchase,
        annualPurchase,
        totalPurchase,
        orderFrequency: orders.length,
        rewardPointsEarned,
        cashbackEarned,
      },

      productWisePurchase: Object.entries(productWisePurchase).map(
        ([productName, amount]) => ({
          productName,
          amount,
        })
      ),

      categoryWisePurchase: Object.entries(categoryWisePurchase).map(
        ([category, amount]) => ({
          category,
          amount,
        })
      ),

      purchaseTrend: orders.map((order) => ({
        date: order.createdAt,
        amount: Number(order.totalAmount || 0),
      })),

      orders,
    });
  } catch (error) {
    console.error(
      "Dealer purchase analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getDealerPurchaseAnalytics,
};