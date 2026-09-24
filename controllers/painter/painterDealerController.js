const User = require("../../models/superadmin/User");

const getPainterDealers = async (req, res) => {
    try {
        const dealers = await User.find({
            role: "DEALER",
            status: "ACTIVE",
        })
            .select("_id name")
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            dealers,
        });
    } catch (error) {
        console.error("Get painter dealers error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dealers",
        });
    }
};

module.exports = {
    getPainterDealers,
};