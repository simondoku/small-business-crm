const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config({ path: "../.env" });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected for createdBy field fix");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const fixCreatedByFields = async () => {
  try {
    await connectDB();

    // Find all users with null or missing createdBy field
    const usersWithNullCreatedBy = await User.find({
      $or: [{ createdBy: null }, { createdBy: { $exists: false } }],
    });

    console.log(
      `Found ${usersWithNullCreatedBy.length} users with null/missing createdBy field`
    );

    if (usersWithNullCreatedBy.length === 0) {
      console.log(
        "✅ No users need fixing - all users have proper createdBy fields"
      );
      process.exit(0);
    }

    // Find the first admin (should be the original admin)
    const firstAdmin = await User.findOne({ role: "admin" }).sort({
      createdAt: 1,
    });

    if (!firstAdmin) {
      console.log("❌ No admin found - cannot fix createdBy fields");
      process.exit(1);
    }

    console.log(
      `Using first admin as creator: ${firstAdmin.name} (${firstAdmin.email})`
    );

    // Separate the first admin from other users
    let fixedCount = 0;
    let skippedAdminCount = 0;

    for (const user of usersWithNullCreatedBy) {
      // Don't set createdBy for the first admin (they created themselves)
      if (user._id.toString() === firstAdmin._id.toString()) {
        console.log(
          `⏭️  Skipping first admin: ${user.name} (should not have createdBy)`
        );
        skippedAdminCount++;
        continue;
      }

      // Set createdBy to the first admin for all other users
      await User.findByIdAndUpdate(user._id, {
        createdBy: firstAdmin._id,
      });

      console.log(
        `✅ Fixed user: ${user.name} (${user.email}) - set createdBy to ${firstAdmin.name}`
      );
      fixedCount++;
    }

    console.log("\n📊 Summary:");
    console.log(`✅ Fixed ${fixedCount} users`);
    console.log(
      `⏭️  Skipped ${skippedAdminCount} admin(s) (first admin should not have createdBy)`
    );
    console.log("🎉 All users now have proper business isolation!");
  } catch (error) {
    console.error("Error fixing createdBy fields:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the fix
fixCreatedByFields();
