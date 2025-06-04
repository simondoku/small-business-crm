// test-jwt.js - Simple script to test JWT authentication locally
const jwt = require("jsonwebtoken");
require("dotenv").config();

console.log("=== JWT Testing Script ===\n");

// Test JWT_SECRET is available
console.log("1. Environment Check:");
console.log("   JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log(
  "   JWT_SECRET length:",
  process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
);
console.log("   MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("");

// Create a test JWT token (simulating what happens during login)
console.log("2. Creating test JWT token:");
const testUserId = "507f1f77bcf86cd799439011"; // Fake MongoDB ObjectId
const testToken = jwt.sign({ id: testUserId }, process.env.JWT_SECRET, {
  expiresIn: "30d",
});
console.log("   Test token created:", testToken.substring(0, 50) + "...");
console.log("   Token length:", testToken.length);
console.log("");

// Test JWT verification (simulating what happens in serverless functions)
console.log("3. Verifying JWT token:");
try {
  const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
  console.log("   ✅ Token verification successful!");
  console.log("   Decoded user ID:", decoded.id);
  console.log("   Token expires:", new Date(decoded.exp * 1000));
} catch (error) {
  console.log("   ❌ Token verification failed:", error.message);
}

console.log("");
console.log("4. Test JWT token for API testing:");
console.log("   Use this token in Authorization header:");
console.log("   Authorization: Bearer " + testToken);
console.log("");
console.log("5. Test with curl:");
console.log("   curl -X GET http://localhost:3000/api/debug-auth \\");
console.log('     -H "Authorization: Bearer ' + testToken + '"');
