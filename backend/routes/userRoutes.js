// backend/routes/userRoutes.js
const express = require("express");
const {
  authUser,
  registerUser,
  getUserProfile,
  checkSetup,
  getUsers,
  logoutUser,
  getUserActivity,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/login", authUser);
router.post("/", registerUser); // Anyone can register, first user will be admin
router.get("/check-setup", checkSetup);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.post("/logout", protect, logoutUser); // New logout endpoint to record logout activity
router.get("/", protect, admin, getUsers); // Only admin can get all users
router.get("/:userId/activity", protect, admin, getUserActivity); // New endpoint to get user activity history

// Admin routes for user management
router.post("/create", protect, admin, registerUser); // Admin-only user creation with auth context
router.put("/:userId", protect, admin, updateUser); // Update user (admin only)
router.delete("/:userId", protect, admin, deleteUser); // Delete user (admin only)

module.exports = router;
