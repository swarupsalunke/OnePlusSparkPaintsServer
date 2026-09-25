const PainterProfile = require("../../models/painter/PainterProfile");
const RewardWallet = require("../../models/superadmin/RewardWallet");

const getSharePainterProfile = async (req, res) => {
  try {
    const painterId = req.user.userId;

    const profile = await PainterProfile.findOne({ painterId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Painter profile not found",
      });
    }

    const wallet = await RewardWallet.findOne({
      user: painterId,
    });

    res.status(200).json({
      success: true,
      data: {
        painterId: profile.painterId,
        name: profile.name,
        profileImage: profile.profileImage,
        tier: profile.tier,
        rewardsEarned: wallet ? wallet.lifetimeEarnings : 0,
        joinedAt: profile.joinedAt,
      },
    });
  } catch (error) {
    console.error("Get Share Painter Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch share profile",
      error: error.message,
    });
  }
};

module.exports = {
  getSharePainterProfile,
};