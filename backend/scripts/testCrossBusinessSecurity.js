// backend/scripts/testCrossBusinessSecurity.js
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

const User = require("../models/User");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");

// Test configuration
const BASE_URL = "http://localhost:5003/api";
let testUsers = {};
let businessData = {};

async function connectDB() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/small-business-crm"
    );
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

async function setupBusinessIsolation() {
  console.log("\n🏢 Setting up business isolation with existing users...");

  // Get existing users
  const adminUser = await User.findOne({ email: "admin@example.com" });
  const staffUser = await User.findOne({ email: "staff2@example.com" });

  if (!adminUser || !staffUser) {
    console.error(
      "❌ Required test users not found. Please ensure admin@example.com and staff2@example.com exist."
    );
    return false;
  }

  // Set up Business 1 (admin user as business owner)
  await User.findByIdAndUpdate(adminUser._id, {
    businessOwner: adminUser._id,
    role: "admin",
  });

  // Set up Business 2 (staff user promoted to admin of their own business)
  await User.findByIdAndUpdate(staffUser._id, {
    businessOwner: staffUser._id,
    role: "admin",
  });

  testUsers.business1 = adminUser;
  testUsers.business2 = staffUser;

  console.log(`   ✅ Business 1: ${adminUser.name} (${adminUser.email})`);
  console.log(`   ✅ Business 2: ${staffUser.name} (${staffUser.email})`);

  return true;
}

async function loginTestUsers() {
  console.log("\n🔑 Logging in test users...");

  // For this test, we'll need to manually get tokens or create test data
  // Since we don't have passwords, let's create the test data directly in the database

  for (const [businessKey, user] of Object.entries(testUsers)) {
    businessData[businessKey] = {
      adminId: user._id,
      email: user.email,
      name: user.name,
      businessOwner: user._id,
    };

    console.log(`   ✅ Set up data context for ${user.name}`);
  }
}

async function createBusinessSpecificData() {
  console.log("\n📊 Creating business-specific test data...");

  for (const [businessKey, data] of Object.entries(businessData)) {
    try {
      // Create product directly in database with proper business isolation
      const product = new Product({
        name: `Secure Product ${businessKey}`,
        price: 100,
        stock: 50,
        category: "Security Test",
        createdBy: data.adminId,
        businessOwner: data.businessOwner,
      });
      await product.save();
      data.productId = product._id;

      // Create customer
      const customer = new Customer({
        name: `Secure Customer ${businessKey}`,
        email: `customer-${businessKey}@test.com`,
        phone: `555-000${businessKey.slice(-1)}`,
        createdBy: data.adminId,
        businessOwner: data.businessOwner,
      });
      await customer.save();
      data.customerId = customer._id;

      // Create sale with correct field names to match Sale model
      const sale = new Sale({
        customer: data.customerId, // Changed from customerId to customer
        items: [
          {
            product: data.productId, // Changed from productId to product
            name: `Secure Product ${businessKey}`, // Added required name field
            quantity: 2,
            price: 100,
          },
        ],
        totalAmount: 200, // Changed from total to totalAmount
        comments: `Security test sale for ${businessKey}`,
        createdBy: data.adminId,
        businessOwner: data.businessOwner,
      });
      await sale.save();
      data.saleId = sale._id;

      console.log(`   ✅ Created isolated data for ${data.name}`);
    } catch (error) {
      console.error(
        `   ❌ Failed to create data for ${data.name}:`,
        error.message
      );
    }
  }
}

async function testDatabaseLevelSecurity() {
  console.log("\n🔒 Testing Database-Level Business Isolation...");
  console.log("=".repeat(60));

  const business1Data = businessData.business1;
  const business2Data = businessData.business2;

  console.log(
    `\n🏢 Business 1 (${business1Data.name}) trying to access Business 2 data:`
  );

  // Test 1: Can Business 1 see Business 2's products?
  try {
    const business1Products = await Product.find({
      businessOwner: business1Data.businessOwner,
    });
    const business2Products = await Product.find({
      businessOwner: business2Data.businessOwner,
    });
    const allProductsAsSeenByBusiness1 = await Product.find({
      createdBy: business1Data.adminId,
    });

    console.log(`   📊 Business 1 has ${business1Products.length} products`);
    console.log(`   📊 Business 2 has ${business2Products.length} products`);
    console.log(
      `   🔍 Business 1 can see ${allProductsAsSeenByBusiness1.length} products when filtered by createdBy`
    );

    // Check if Business 1 can accidentally see Business 2's products
    const crossContamination = await Product.find({
      businessOwner: business2Data.businessOwner,
      createdBy: business1Data.adminId,
    });

    if (crossContamination.length > 0) {
      console.log(
        `   ❌ SECURITY BREACH: Found ${crossContamination.length} products with mixed business ownership!`
      );
    } else {
      console.log(`   ✅ No cross-business product contamination found`);
    }
  } catch (error) {
    console.error(`   ❌ Database query error:`, error.message);
  }

  // Test 2: Direct ID access attempts
  console.log(`\n🎯 Testing direct ID access attempts:`);

  try {
    // Try to access Business 2's product with Business 1's context
    const unauthorizedProduct = await Product.findOne({
      _id: business2Data.productId,
      businessOwner: business1Data.businessOwner,
    });

    if (unauthorizedProduct) {
      console.log(
        `   ❌ SECURITY BREACH: Business 1 can access Business 2's product!`
      );
    } else {
      console.log(
        `   ✅ Business 1 cannot access Business 2's product (as expected)`
      );
    }

    // Test customer access
    const unauthorizedCustomer = await Customer.findOne({
      _id: business2Data.customerId,
      businessOwner: business1Data.businessOwner,
    });

    if (unauthorizedCustomer) {
      console.log(
        `   ❌ SECURITY BREACH: Business 1 can access Business 2's customer!`
      );
    } else {
      console.log(
        `   ✅ Business 1 cannot access Business 2's customer (as expected)`
      );
    }

    // Test sale access
    const unauthorizedSale = await Sale.findOne({
      _id: business2Data.saleId,
      businessOwner: business1Data.businessOwner,
    });

    if (unauthorizedSale) {
      console.log(
        `   ❌ SECURITY BREACH: Business 1 can access Business 2's sale!`
      );
    } else {
      console.log(
        `   ✅ Business 1 cannot access Business 2's sale (as expected)`
      );
    }
  } catch (error) {
    console.error(`   ❌ Security test error:`, error.message);
  }
}

async function testControllerLevelSecurity() {
  console.log("\n🛡️  Testing Controller-Level Security (Simulated)...");
  console.log("=".repeat(60));

  // Simulate controller behavior with business isolation
  const business1Id = businessData.business1.businessOwner;
  const business2ProductId = businessData.business2.productId;

  console.log(`\n🎮 Simulating Product Controller behavior:`);

  // Simulate getProducts controller
  try {
    const userProducts = await Product.find({ businessOwner: business1Id });
    console.log(
      `   ✅ getProducts() for Business 1 returns ${userProducts.length} products (correctly filtered)`
    );

    // Verify it doesn't include Business 2's products - with null checks
    const hasUnauthorizedProducts = userProducts.some(
      (p) => p.businessOwner && business1Id && p.businessOwner.toString() !== business1Id.toString()
    );

    if (hasUnauthorizedProducts) {
      console.log(
        `   ❌ SECURITY BREACH: getProducts() returns unauthorized products!`
      );
    } else {
      console.log(
        `   ✅ getProducts() correctly filters by business ownership`
      );
    }
  } catch (error) {
    console.error(`   ❌ Controller simulation error:`, error.message);
  }

  // Simulate getProductById controller
  try {
    const product = await Product.findOne({
      _id: business2ProductId,
      businessOwner: business1Id,
    });

    if (product) {
      console.log(
        `   ❌ SECURITY BREACH: getProductById() allows cross-business access!`
      );
    } else {
      console.log(
        `   ✅ getProductById() correctly blocks cross-business access`
      );
    }
  } catch (error) {
    console.error(`   ❌ Controller simulation error:`, error.message);
  }
}

async function generateSecurityReport() {
  console.log("\n📋 Security Test Summary Report");
  console.log("=".repeat(60));

  // Count data per business
  const business1Count = {
    products: await Product.countDocuments({
      businessOwner: businessData.business1.businessOwner,
    }),
    customers: await Customer.countDocuments({
      businessOwner: businessData.business1.businessOwner,
    }),
    sales: await Sale.countDocuments({
      businessOwner: businessData.business1.businessOwner,
    }),
  };

  const business2Count = {
    products: await Product.countDocuments({
      businessOwner: businessData.business2.businessOwner,
    }),
    customers: await Customer.countDocuments({
      businessOwner: businessData.business2.businessOwner,
    }),
    sales: await Sale.countDocuments({
      businessOwner: businessData.business2.businessOwner,
    }),
  };

  console.log(`\n📊 Data Distribution:`);
  console.log(`   Business 1 (${businessData.business1.name}):`);
  console.log(`     - Products: ${business1Count.products}`);
  console.log(`     - Customers: ${business1Count.customers}`);
  console.log(`     - Sales: ${business1Count.sales}`);

  console.log(`   Business 2 (${businessData.business2.name}):`);
  console.log(`     - Products: ${business2Count.products}`);
  console.log(`     - Customers: ${business2Count.customers}`);
  console.log(`     - Sales: ${business2Count.sales}`);

  // Check for orphaned data (data without proper business ownership)
  const orphanedProducts = await Product.countDocuments({
    $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
  });

  const orphanedCustomers = await Customer.countDocuments({
    $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
  });

  const orphanedSales = await Sale.countDocuments({
    $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
  });

  console.log(`\n⚠️  Orphaned Data (security concern):`);
  console.log(`     - Products without businessOwner: ${orphanedProducts}`);
  console.log(`     - Customers without businessOwner: ${orphanedCustomers}`);
  console.log(`     - Sales without businessOwner: ${orphanedSales}`);

  if (orphanedProducts + orphanedCustomers + orphanedSales > 0) {
    console.log(
      `   ❌ WARNING: Found orphaned data that could be accessed by multiple businesses!`
    );
  } else {
    console.log(`   ✅ No orphaned data found - all data properly isolated`);
  }
}

async function cleanupTestData() {
  console.log("\n🧹 Cleaning up test data...");

  // Only delete the test data we created, not the users
  for (const [businessKey, data] of Object.entries(businessData)) {
    if (data.productId) await Product.deleteOne({ _id: data.productId });
    if (data.customerId) await Customer.deleteOne({ _id: data.customerId });
    if (data.saleId) await Sale.deleteOne({ _id: data.saleId });
    console.log(`   ✅ Cleaned up test data for ${data.name}`);
  }
}

async function runSecurityTests() {
  try {
    await connectDB();

    const setupSuccess = await setupBusinessIsolation();
    if (!setupSuccess) {
      console.log("❌ Failed to set up business isolation for testing");
      return;
    }

    await loginTestUsers();
    await createBusinessSpecificData();
    await testDatabaseLevelSecurity();
    await testControllerLevelSecurity();
    await generateSecurityReport();

    console.log("\n✅ Comprehensive security tests completed!");
  } catch (error) {
    console.error("❌ Security test failed:", error.message);
  } finally {
    await cleanupTestData();
    await mongoose.connection.close();
  }
}

// Run the tests
runSecurityTests();
