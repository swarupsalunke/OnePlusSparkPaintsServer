const mongoose = require("mongoose");

const DEFAULT_MONGO_URI =
  "mongodb+srv://jack:181823@cluster0.secm5vp.mongodb.net/CustomerRelationshipManagement?appName=Cluster0";

const connectDB = async () => {
  let uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  if (uri.includes("k1zid2i.mongodb.net")) {
    console.warn("Configured MONGO_URI uses obsolete cluster host. Falling back to active cluster.");
    uri = DEFAULT_MONGO_URI;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("MongoDB primary connection failed:", error.message);
    if (uri !== DEFAULT_MONGO_URI) {
      console.log("Attempting fallback to default MongoDB Atlas cluster...");
      try {
        await mongoose.connect(DEFAULT_MONGO_URI);
        console.log("MongoDB Atlas connected successfully via fallback URI");
      } catch (fallbackError) {
        console.error("MongoDB fallback connection failed:", fallbackError.message);
      }
    }
  }
};

module.exports = connectDB;