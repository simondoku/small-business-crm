// backend/scripts/simpleCleanup.js
const mongoose = require("mongoose");
require("dotenv").config();

async function simpleCleanup() {
  try {
    console.log("Connecting...");
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/small-business-crm"
    );

    console.log("Finding admin user...");
    const admin = await mongoose.connection.db
      .collection("users")
      .findOne({ email: "admin@example.com" });

    if (!admin) {
      console.log("No admin found");
      process.exit(1);
    }

    console.log("Admin found:", admin.name);
    console.log("Admin ID:", admin._id);

    console.log("Updating orphaned products...");
    const result = await mongoose.connection.db
      .collection("products")
      .updateMany(
        { businessOwner: null },
        { $set: { businessOwner: admin._id } }
      );

    console.log("Update result:", result.modifiedCount, "products updated");

    // Check remaining
    const remaining = await mongoose.connection.db
      .collection("products")
      .countDocuments({
        businessOwner: null,
      });

    console.log("Remaining orphaned:", remaining);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("Done");
  }
}

simpleCleanup();
