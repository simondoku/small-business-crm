// backend/scripts/cleanupOrphanedData.js
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");
const User = require("../models/User");
require("dotenv").config();

async function cleanupOrphanedData() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/small-business-crm"
    );
    console.log("✅ Connected to MongoDB");

    console.log("\n🧹 Starting orphaned data cleanup...\n");

    // Get the admin user to assign orphaned data to
    const adminUser = await User.findOne({ email: "admin@example.com" });
    if (!adminUser) {
      console.log("❌ Admin user not found");
      await mongoose.connection.close();
      return;
    }

    console.log(
      `📋 Assigning orphaned data to: ${adminUser.name} (${adminUser.email})\n`
    );

    // Fix orphaned products
    const orphanedProducts = await Product.find({
      $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
    });

    let fixedProducts = 0;
    for (const product of orphanedProducts) {
      await Product.findByIdAndUpdate(product._id, {
        businessOwner: adminUser._id,
      });
      console.log(`✅ Fixed product: ${product.name}`);
      fixedProducts++;
    }

    // Fix orphaned customers
    const orphanedCustomers = await Customer.find({
      $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
    });

    let fixedCustomers = 0;
    for (const customer of orphanedCustomers) {
      await Customer.findByIdAndUpdate(customer._id, {
        businessOwner: adminUser._id,
      });
      console.log(`✅ Fixed customer: ${customer.name}`);
      fixedCustomers++;
    }

    // Fix orphaned sales
    const orphanedSales = await Sale.find({
      $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
    });

    let fixedSales = 0;
    for (const sale of orphanedSales) {
      await Sale.findByIdAndUpdate(sale._id, {
        businessOwner: adminUser._id,
      });
      console.log(`✅ Fixed sale: ${sale._id}`);
      fixedSales++;
    }

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   - Fixed ${fixedProducts} products`);
    console.log(`   - Fixed ${fixedCustomers} customers`);
    console.log(`   - Fixed ${fixedSales} sales`);

    console.log("\n✅ Orphaned data cleanup completed!");
  } catch (error) {
    console.error("❌ Cleanup failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

cleanupOrphanedData();
