// backend/scripts/fixOrphanedProduct.js
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
require("dotenv").config();

async function fixOrphanedProduct() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/small-business-crm"
    );
    console.log("✅ Connected to MongoDB");

    // Find the admin user to assign orphaned data to
    const admin = await User.findOne({ email: "admin@example.com" });
    if (!admin) {
      console.log("❌ Admin user not found");
      return;
    }

    console.log(`👤 Found admin: ${admin.name} (${admin._id})`);

    // Find the specific orphaned product
    const orphanedProduct = await Product.findOne({
      $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
    });

    if (!orphanedProduct) {
      console.log("✅ No orphaned products found");
      return;
    }

    console.log(
      `🔍 Found orphaned product: ${orphanedProduct.name} (ID: ${orphanedProduct._id})`
    );

    // Fix the orphaned product
    await Product.findByIdAndUpdate(orphanedProduct._id, {
      businessOwner: admin._id,
    });

    console.log(`✅ Fixed product: assigned businessOwner to ${admin.name}`);

    // Verify the fix
    const remaining = await Product.countDocuments({
      $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }],
    });

    console.log(`🔍 Remaining orphaned products: ${remaining}`);

    if (remaining === 0) {
      console.log("🎉 All orphaned products have been fixed!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

fixOrphanedProduct();
