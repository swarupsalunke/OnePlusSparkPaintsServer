const PainterProfile = require("../../models/painter/PainterProfile");

const getPainterList = async (req, res) => {
  try {
    const painters = await PainterProfile.find()
      .select("_id name mobile email city painterId")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: painters.length,
      painters,
    });
  } catch (error) {
    console.error("Get Painter List Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch painter list",
    });
  }
};

module.exports = { getPainterList };