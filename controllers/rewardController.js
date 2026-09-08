const RewardWallet = require("../models/RewardWallet");
const RewardTransaction = require("../models/RewardTransaction");
const User = require("../models/User");

// Get Reward Dashboard
const getRewardDashboard = async (req, res) => {
  try {
    const wallets = await RewardWallet.find()
      .populate("user", "name email mobile role")
      .sort({ updatedAt: -1 });

    const transactions = await RewardTransaction.find()
      .populate("user", "name email mobile role")
      .sort({ createdAt: -1 });

    const totalPoints = wallets.reduce(
      (sum, wallet) => sum + wallet.currentPoints,
      0
    );

    const totalCash = wallets.reduce(
      (sum, wallet) => sum + wallet.currentCashBalance,
      0
    );

    const lifetimeEarnings = wallets.reduce(
      (sum, wallet) => sum + wallet.lifetimeEarnings,
      0
    );

    const redeemedAmount = wallets.reduce(
      (sum, wallet) => sum + wallet.redeemedAmount,
      0
    );

    const pendingRewards = wallets.reduce(
      (sum, wallet) => sum + wallet.pendingRewards,
      0
    );

    const pointsIssued = transactions
      .filter(
        (transaction) =>
          transaction.rewardType === "POINTS" &&
          ["ADD", "APPROVE", "RELEASE"].includes(
            transaction.transactionType
          )
      )
      .reduce((sum, transaction) => sum + transaction.points, 0);

    const cashIssued = transactions
      .filter(
        (transaction) =>
          transaction.rewardType === "CASH" &&
          ["ADD", "RELEASE"].includes(transaction.transactionType)
      )
      .reduce((sum, transaction) => sum + transaction.cashAmount, 0);

    res.status(200).json({
      success: true,
      summary: {
        totalPoints,
        totalCash,
        lifetimeEarnings,
        redeemedAmount,
        pendingRewards,
        pointsIssued,
        cashIssued,
      },
      wallets,
      transactions,
    });
  } catch (error) {
    console.error("Get reward dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reward dashboard",
      error: error.message,
    });
  }
};


// Get Wallet
const getRewardWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    const wallet = await RewardWallet.findOne({
      user: userId,
    }).populate("user", "name email mobile role");

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Reward wallet not found",
      });
    }

    res.status(200).json({
      success: true,
      wallet,
    });
  } catch (error) {
    console.error("Get reward wallet error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reward wallet",
      error: error.message,
    });
  }
};


// Add Points
const addPoints = async (req, res) => {
  try {
    const { userId, points, description, reference } = req.body;

    if (!userId || !points) {
      return res.status(400).json({
        success: false,
        message: "userId and points are required",
      });
    }

    const user = await User.findById(userId);

    if (!user || !["DEALER", "PAINTER"].includes(user.role)) {
      return res.status(404).json({
        success: false,
        message: "Dealer or Painter not found",
      });
    }

    let wallet = await RewardWallet.findOne({
      user: userId,
    });

    if (!wallet) {
      wallet = await RewardWallet.create({
        user: userId,
        userType: user.role,
      });
    }

    wallet.currentPoints += Number(points);
    wallet.lifetimeEarnings += Number(points);

    await wallet.save();

    const transaction = await RewardTransaction.create({
      user: userId,
      userType: user.role,
      rewardType: "POINTS",
      transactionType: "ADD",
      points: Number(points),
      status: "COMPLETED",
      description,
      reference,
    });

    res.status(201).json({
      success: true,
      message: "Points added successfully",
      wallet,
      transaction,
    });
  } catch (error) {
    console.error("Add points error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add points",
      error: error.message,
    });
  }
};


// Deduct Points
const deductPoints = async (req, res) => {
  try {
    const { userId, points, description, reference } = req.body;

    if (!userId || !points) {
      return res.status(400).json({
        success: false,
        message: "userId and points are required",
      });
    }

    const wallet = await RewardWallet.findOne({
      user: userId,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Reward wallet not found",
      });
    }

    if (wallet.currentPoints < Number(points)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient points",
      });
    }

    const user = await User.findById(userId);

    wallet.currentPoints -= Number(points);

    await wallet.save();

    const transaction = await RewardTransaction.create({
      user: userId,
      userType: user.role,
      rewardType: "POINTS",
      transactionType: "DEDUCT",
      points: Number(points),
      status: "COMPLETED",
      description,
      reference,
    });

    res.status(200).json({
      success: true,
      message: "Points deducted successfully",
      wallet,
      transaction,
    });
  } catch (error) {
    console.error("Deduct points error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to deduct points",
      error: error.message,
    });
  }
};


// Add Cash
const addCash = async (req, res) => {
  try {
    const { userId, cashAmount, description, reference } = req.body;

    if (!userId || !cashAmount) {
      return res.status(400).json({
        success: false,
        message: "userId and cashAmount are required",
      });
    }

    const user = await User.findById(userId);

    if (!user || !["DEALER", "PAINTER"].includes(user.role)) {
      return res.status(404).json({
        success: false,
        message: "Dealer or Painter not found",
      });
    }

    let wallet = await RewardWallet.findOne({
      user: userId,
    });

    if (!wallet) {
      wallet = await RewardWallet.create({
        user: userId,
        userType: user.role,
      });
    }

    wallet.currentCashBalance += Number(cashAmount);
    wallet.lifetimeEarnings += Number(cashAmount);

    await wallet.save();

    const transaction = await RewardTransaction.create({
      user: userId,
      userType: user.role,
      rewardType: "CASH",
      transactionType: "ADD",
      cashAmount: Number(cashAmount),
      status: "COMPLETED",
      description,
      reference,
    });

    res.status(201).json({
      success: true,
      message: "Cash reward added successfully",
      wallet,
      transaction,
    });
  } catch (error) {
    console.error("Add cash error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add cash reward",
      error: error.message,
    });
  }
};


// Deduct Cash
const deductCash = async (req, res) => {
  try {
    const { userId, cashAmount, description, reference } = req.body;

    if (!userId || !cashAmount) {
      return res.status(400).json({
        success: false,
        message: "userId and cashAmount are required",
      });
    }

    const wallet = await RewardWallet.findOne({
      user: userId,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Reward wallet not found",
      });
    }

    if (wallet.currentCashBalance < Number(cashAmount)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient cash balance",
      });
    }

    const user = await User.findById(userId);

    wallet.currentCashBalance -= Number(cashAmount);

    await wallet.save();

    const transaction = await RewardTransaction.create({
      user: userId,
      userType: user.role,
      rewardType: "CASH",
      transactionType: "DEDUCT",
      cashAmount: Number(cashAmount),
      status: "COMPLETED",
      description,
      reference,
    });

    res.status(200).json({
      success: true,
      message: "Cash reward deducted successfully",
      wallet,
      transaction,
    });
  } catch (error) {
    console.error("Deduct cash error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to deduct cash reward",
      error: error.message,
    });
  }
};


// Get Reward Transactions
const getRewardTransactions = async (req, res) => {
  try {
    const { userId, userType, rewardType, status } = req.query;

    const filter = {};

    if (userId) filter.user = userId;
    if (userType) filter.userType = userType;
    if (rewardType) filter.rewardType = rewardType;
    if (status) filter.status = status;

    const transactions = await RewardTransaction.find(filter)
      .populate("user", "name email mobile role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get reward transactions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reward transactions",
      error: error.message,
    });
  }
};

const updateRewardTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, reference, status } = req.body;

    const transaction = await RewardTransaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Reward transaction not found",
      });
    }

    if (description !== undefined) {
      transaction.description = description;
    }

    if (reference !== undefined) {
      transaction.reference = reference;
    }

    if (status !== undefined) {
      transaction.status = status;
    }

    await transaction.save();

    return res.status(200).json({
      success: true,
      message: "Reward transaction updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Update reward transaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update reward transaction",
      error: error.message,
    });
  }
};

// Delete Reward Transaction
const deleteRewardTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await RewardTransaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Reward transaction not found",
      });
    }

    await RewardTransaction.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Reward transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete reward transaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete reward transaction",
      error: error.message,
    });
  }
};


module.exports = {
  getRewardDashboard,
  getRewardWallet,
  addPoints,
  deductPoints,
  addCash,
  deductCash,
  getRewardTransactions,
  updateRewardTransaction,
  deleteRewardTransaction
};