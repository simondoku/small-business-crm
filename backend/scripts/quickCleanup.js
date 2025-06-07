// backend/scripts/quickCleanup.js
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");
const User = require("../models/User");
require("dotenv").config();

async function quickCleanup() {
  console.log("🔗 Connecting to database...");

  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/small-business-crm"
    );
    console.log("✅ Connected");

    // Get admin user quickly
    const admin = await User.findOne({ email: "admin@example.com" }).select(
      "_id name"
    );
    if (!admin) {
      console.log("❌ No admin found");
      process.exit(1);
    }

    console.log(`👤 Using admin: ${admin.name}`);

    // Quick update operations
    const productResult = await Product.updateMany(
      { $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }] },
      { $set: { businessOwner: admin._id } }
    );

    const customerResult = await Customer.updateMany(
      { $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }] },
      { $set: { businessOwner: admin._id } }
    );

    const saleResult = await Sale.updateMany(
      { $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }] },
      { $set: { businessOwner: admin._id } }
    );

    console.log("📊 Results:");
    console.log(`   Products fixed: ${productResult.modifiedCount}`);
    console.log(`   Customers fixed: ${customerResult.modifiedCount}`);
    console.log(`   Sales fixed: ${saleResult.modifiedCount}`);

    console.log("✅ Cleanup done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

quickCleanup();
