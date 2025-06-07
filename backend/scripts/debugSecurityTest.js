// backend/scripts/debugSecurityTest.js
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");

async function checkOrphanedData(step) {
  const orphanedProducts = await Product.countDocuments({
    $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
  });

  const orphanedCustomers = await Customer.countDocuments({
    $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
  });

  const orphanedSales = await Sale.countDocuments({
    $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
  });

  console.log(`\n🔍 ${step} - Orphaned data check:`);
  console.log(`   Products: ${orphanedProducts}`);
  console.log(`   Customers: ${orphanedCustomers}`);
  console.log(`   Sales: ${orphanedSales}`);

  return orphanedProducts + orphanedCustomers + orphanedSales;
}

async function debugSecurityTest() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/small-business-crm"
    );
    console.log("✅ Connected to MongoDB");

    // Check initial state
    await checkOrphanedData("Initial state");

    // Get existing users
    const adminUser = await User.findOne({ email: "admin@example.com" });
    const staffUser = await User.findOne({ email: "staff2@example.com" });

    if (!adminUser || !staffUser) {
      console.error("❌ Required test users not found");
      return;
    }

    console.log(`\n👥 Found users:`);
    console.log(`   Admin: ${adminUser.name} (${adminUser.email})`);
    console.log(`   Staff: ${staffUser.name} (${staffUser.email})`);

    // Check after finding users
    await checkOrphanedData("After finding users");

    // Set up business isolation
    await User.findByIdAndUpdate(adminUser._id, {
      businessOwner: adminUser._id,
      role: "admin",
    });

    await User.findByIdAndUpdate(staffUser._id, {
      businessOwner: staffUser._id,
      role: "admin",
    });

    console.log("\n🏢 Updated user business ownership");
    await checkOrphanedData("After updating user business ownership");

    // Create test data for business 1
    console.log("\n📊 Creating test data for Business 1...");
    const product1 = new Product({
      name: "Debug Product 1",
      price: 100,
      stock: 50,
      category: "Debug Test",
      createdBy: adminUser._id,
      businessOwner: adminUser._id,
    });
    await product1.save();
    console.log(`✅ Created product 1: ${product1._id}`);

    await checkOrphanedData("After creating product 1");

    const customer1 = new Customer({
      name: "Debug Customer 1",
      email: "debug1@test.com",
      phone: "555-0001",
      createdBy: adminUser._id,
      businessOwner: adminUser._id,
    });
    await customer1.save();
    console.log(`✅ Created customer 1: ${customer1._id}`);

    await checkOrphanedData("After creating customer 1");

    const sale1 = new Sale({
      customer: customer1._id,
      items: [
        {
          product: product1._id,
          name: "Debug Product 1",
          quantity: 2,
          price: 100,
        },
      ],
      totalAmount: 200,
      comments: "Debug test sale 1",
      createdBy: adminUser._id,
      businessOwner: adminUser._id,
    });
    await sale1.save();
    console.log(`✅ Created sale 1: ${sale1._id}`);

    await checkOrphanedData("After creating sale 1");

    // Create test data for business 2
    console.log("\n📊 Creating test data for Business 2...");
    const product2 = new Product({
      name: "Debug Product 2",
      price: 200,
      stock: 30,
      category: "Debug Test",
      createdBy: staffUser._id,
      businessOwner: staffUser._id,
    });
    await product2.save();
    console.log(`✅ Created product 2: ${product2._id}`);

    await checkOrphanedData("After creating product 2");

    const customer2 = new Customer({
      name: "Debug Customer 2",
      email: "debug2@test.com",
      phone: "555-0002",
      createdBy: staffUser._id,
      businessOwner: staffUser._id,
    });
    await customer2.save();
    console.log(`✅ Created customer 2: ${customer2._id}`);

    await checkOrphanedData("After creating customer 2");

    const sale2 = new Sale({
      customer: customer2._id,
      items: [
        {
          product: product2._id,
          name: "Debug Product 2",
          quantity: 1,
          price: 200,
        },
      ],
      totalAmount: 200,
      comments: "Debug test sale 2",
      createdBy: staffUser._id,
      businessOwner: staffUser._id,
    });
    await sale2.save();
    console.log(`✅ Created sale 2: ${sale2._id}`);

    const finalOrphanedCount = await checkOrphanedData("Final check");

    if (finalOrphanedCount > 0) {
      console.log("\n❌ Found orphaned data! Let's investigate...");

      const orphanedProductDetails = await Product.find({
        $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
      }).select("name price createdBy businessOwner");

      const orphanedCustomerDetails = await Customer.find({
        $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
      }).select("name email createdBy businessOwner");

      const orphanedSaleDetails = await Sale.find({
        $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
      }).select("_id totalAmount createdBy businessOwner");

      console.log("\n🔍 Orphaned products:", orphanedProductDetails);
      console.log("🔍 Orphaned customers:", orphanedCustomerDetails);
      console.log("🔍 Orphaned sales:", orphanedSaleDetails);
    } else {
      console.log(
        "\n✅ No orphaned data found - all records properly isolated!"
      );
    }

    // Cleanup
    console.log("\n🧹 Cleaning up debug test data...");
    await Product.deleteOne({ _id: product1._id });
    await Product.deleteOne({ _id: product2._id });
    await Customer.deleteOne({ _id: customer1._id });
    await Customer.deleteOne({ _id: customer2._id });
    await Sale.deleteOne({ _id: sale1._id });
    await Sale.deleteOne({ _id: sale2._id });
    console.log("✅ Cleanup completed");
  } catch (error) {
    console.error("❌ Debug test failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

debugSecurityTest();
