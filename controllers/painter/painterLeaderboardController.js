const RewardWallet = require("../../models/superadmin/RewardWallet");
const LoyaltyTier = require("../../models/painter/LoyaltyTier");

const getPainterLeaderboard = async (req, res) => {
  try {
    const wallets = await RewardWallet.find({
      userType: "PAINTER",
    })
      .populate("user", "name")
      .sort({ currentPoints: -1 })
      .lean();

    const tiers = await LoyaltyTier.find({})
      .sort({ minPoints: 1 })
      .lean();

    const leaderboard = wallets.map((wallet, index) => {
      const points = Number(wallet.currentPoints || 0);

      const currentTier =
        tiers
          .filter(
            (tier) =>
              points >= tier.minPoints &&
              (
                tier.maxPoints === null ||
                tier.maxPoints === undefined ||
                points <= tier.maxPoints
              )
          )
          .sort((a, b) => b.minPoints - a.minPoints)[0] || null;

      return {
        rank: index + 1,
        painterId: wallet.user?._id || wallet.user,
        painterName: wallet.user?.name || "Painter",
        tier: currentTier?.name || "SILVER",
        points,
      };
    });

    return res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error(
      "Get Painter Leaderboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch painter leaderboard",
      error: error.message,
    });
  }
};

module.exports = {
  getPainterLeaderboard,
};