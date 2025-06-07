// backend/scripts/thoroughCleanup.js
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");
const User = require("../models/User");
require("dotenv").config();

async function thoroughCleanup() {
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

    console.log("\n🔍 Finding all orphaned data...");

    // Find specific orphaned records to understand what we're dealing with
    const orphanedProducts = await Product.find({
      $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
    }).select("name price createdBy businessOwner");

    const orphanedCustomers = await Customer.find({
      $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
    }).select("name email createdBy businessOwner");

    const orphanedSales = await Sale.find({
      $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
    }).select("_id totalAmount createdBy businessOwner");

    console.log(`\n📊 Found orphaned data:`);
    console.log(`   Products: ${orphanedProducts.length}`);
    orphanedProducts.forEach((p) => {
      console.log(
        `     - ${p.name} (price: ${p.price}, createdBy: ${p.createdBy || "null"}, businessOwner: ${p.businessOwner || "null"})`
      );
    });

    console.log(`   Customers: ${orphanedCustomers.length}`);
    orphanedCustomers.forEach((c) => {
      console.log(
        `     - ${c.name} (email: ${c.email}, createdBy: ${c.createdBy || "null"}, businessOwner: ${c.businessOwner || "null"})`
      );
    });

    console.log(`   Sales: ${orphanedSales.length}`);
    orphanedSales.forEach((s) => {
      console.log(
        `     - Sale ${s._id} (amount: ${s.totalAmount}, createdBy: ${s.createdBy || "null"}, businessOwner: ${s.businessOwner || "null"})`
      );
    });

    if (
      orphanedProducts.length +
        orphanedCustomers.length +
        orphanedSales.length ===
      0
    ) {
      console.log("✅ No orphaned data found - database is clean!");
      return;
    }

    console.log("\n🧹 Fixing orphaned data...");

    // Fix all orphaned data by assigning to admin
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

    console.log(`✅ Fixed ${productResult.modifiedCount} products`);
    console.log(`✅ Fixed ${customerResult.modifiedCount} customers`);
    console.log(`✅ Fixed ${saleResult.modifiedCount} sales`);

    // Also fix any records missing createdBy
    const productCreatedByResult = await Product.updateMany(
      { $or: [{ createdBy: { $exists: false } }, { createdBy: null }] },
      { $set: { createdBy: admin._id } }
    );

    const customerCreatedByResult = await Customer.updateMany(
      { $or: [{ createdBy: { $exists: false } }, { createdBy: null }] },
      { $set: { createdBy: admin._id } }
    );

    const saleCreatedByResult = await Sale.updateMany(
      { $or: [{ createdBy: { $exists: false } }, { createdBy: null }] },
      { $set: { createdBy: admin._id } }
    );

    if (
      productCreatedByResult.modifiedCount +
        customerCreatedByResult.modifiedCount +
        saleCreatedByResult.modifiedCount >
      0
    ) {
      console.log(`\n📝 Also fixed createdBy fields:`);
      console.log(`   Products: ${productCreatedByResult.modifiedCount}`);
      console.log(`   Customers: ${customerCreatedByResult.modifiedCount}`);
      console.log(`   Sales: ${saleCreatedByResult.modifiedCount}`);
    }

    // Final verification
    const finalOrphanedCount = {
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

    console.log(`\n🎯 Final verification:`);
    console.log(`   Orphaned products: ${finalOrphanedCount.products}`);
    console.log(`   Orphaned customers: ${finalOrphanedCount.customers}`);
    console.log(`   Orphaned sales: ${finalOrphanedCount.sales}`);

    if (
      finalOrphanedCount.products +
        finalOrphanedCount.customers +
        finalOrphanedCount.sales ===
      0
    ) {
      console.log("\n🎉 All orphaned data successfully cleaned up!");
    } else {
      console.log("\n⚠️ Some orphaned data still remains");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from database");
  }
}

thoroughCleanup();
