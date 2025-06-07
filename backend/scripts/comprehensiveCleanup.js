// backend/scripts/comprehensiveCleanup.js
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");
const User = require("../models/User");
require("dotenv").config();

async function comprehensiveCleanup() {
  try {
    console.log("🔗 Connecting to database...");
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/small-business-crm"
    );
    console.log("✅ Connected");

    // Get admin user
    const admin = await User.findOne({ email: "admin@example.com" }).select(
      "_id name"
    );
    if (!admin) {
      console.log("❌ No admin found");
      process.exit(1);
    }

    console.log(`👤 Using admin: ${admin.name} (${admin._id})`);

    // Count orphaned data before cleanup
    const beforeCounts = {
      products: await Product.countDocuments({
        $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
      }),
      customers: await Customer.countDocuments({
        $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
      }),
      sales: await Sale.countDocuments({
        $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
      }),
    };

    console.log(`\n📊 Orphaned data before cleanup:`);
    console.log(`   Products: ${beforeCounts.products}`);
    console.log(`   Customers: ${beforeCounts.customers}`);
    console.log(`   Sales: ${beforeCounts.sales}`);

    if (
      beforeCounts.products + beforeCounts.customers + beforeCounts.sales ===
      0
    ) {
      console.log("✅ No orphaned data found - database is clean!");
      return;
    }

    console.log("\n🧹 Cleaning up orphaned data...");

    // Fix orphaned data by assigning to admin
    const productResult = await Product.updateMany(
      { $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }] },
      { $set: { businessOwner: admin._id, createdBy: admin._id } }
    );

    const customerResult = await Customer.updateMany(
      { $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }] },
      { $set: { businessOwner: admin._id, createdBy: admin._id } }
    );

    const saleResult = await Sale.updateMany(
      { $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }] },
      { $set: { businessOwner: admin._id, createdBy: admin._id } }
    );

    console.log(`✅ Fixed ${productResult.modifiedCount} products`);
    console.log(`✅ Fixed ${customerResult.modifiedCount} customers`);
    console.log(`✅ Fixed ${saleResult.modifiedCount} sales`);

    // Verify cleanup
    const afterCounts = {
      products: await Product.countDocuments({
        $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
      }),
      customers: await Customer.countDocuments({
        $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
      }),
      sales: await Sale.countDocuments({
        $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
      }),
    };

    console.log(`\n📊 Orphaned data after cleanup:`);
    console.log(`   Products: ${afterCounts.products}`);
    console.log(`   Customers: ${afterCounts.customers}`);
    console.log(`   Sales: ${afterCounts.sales}`);

    if (
      afterCounts.products + afterCounts.customers + afterCounts.sales ===
      0
    ) {
      console.log("\n🎉 All orphaned data successfully cleaned up!");
    } else {
      console.log(
        "\n⚠️ Some orphaned data remains - may need manual intervention"
      );
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from database");
  }
}

comprehensiveCleanup();
