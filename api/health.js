// api/health.js
const allowCors = require("./serverless");

// Simple health check handler that doesn't require MongoDB
const healthHandler = async (req, res) => {
  if (req.method !== "GET" && req.method !== "OPTIONS") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    console.log("Health check request received");

    // Return basic system info
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      hasMongoUri: !!process.env.MONGO_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      message: "Serverless API is working",
    });
  } catch (error) {
    console.error("Error in health endpoint:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = allowCors(healthHandler);
