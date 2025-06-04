// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import { logoutUser } from "../services/userService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          api.defaults.headers.common["Authorization"] =
            `Bearer ${userData.token}`;

          // If user exists and is admin, assume system is initialized
          if (userData.role === "admin") {
            setInitialized(true);
            setHasAdmin(true);
            setLoading(false);
            return; // Skip setup check if admin is already logged in
          }
        }

        // Check if the system has been initialized (has any admin users)
        try {
          const response = await api.get("/users/check-setup", {
            timeout: 10000, // 10 second timeout for setup check
          });

          if (response.data) {
            setInitialized(response.data.initialized);
            setHasAdmin(response.data.hasAdmin);
          }
        } catch (setupError) {
          console.error("Setup check failed:", setupError);

          // If user is already logged in, assume system is initialized
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setInitialized(true);
            setHasAdmin(userData.role === "admin");
            console.log(
              "Setup check failed but user is logged in - assuming system is initialized"
            );
          } else {
            // If no user logged in and setup check fails, assume setup is needed
            setInitialized(false);
            setHasAdmin(false);
          }

          setAuthError("System setup check failed");
        }
      } catch (error) {
        console.error("Error during authentication initialization:", error);
        localStorage.removeItem("user");
        setAuthError("Authentication failed. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      console.log("Attempting login...");

      const response = await api.post("/users/login", { email, password });

      if (response.data) {
        console.log("Login successful");
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
        api.defaults.headers.common["Authorization"] =
          `Bearer ${response.data.token}`;

        // Update initialization status if admin logs in
        if (response.data.role === "admin") {
          setInitialized(true);
          setHasAdmin(true);
        }

        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      };
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      console.log("Attempting registration...");

      const response = await api.post("/users", userData, {
        timeout: 60000, // 60 seconds for registration
      });

      if (response.data && response.data.success) {
        // Update initialization status if a new admin was successfully registered
        if (userData.role === "admin") {
          setInitialized(true);
          setHasAdmin(true);
        }

        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          message: response.data?.message || "Registration failed.",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);

      // Check if this error is because system is already initialized
      if (error.response?.data?.initialized) {
        setInitialized(true);
        setHasAdmin(true);
      }

      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          message: "Registration timed out. Please try again.",
          isTimeout: true,
        };
      }

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      if (user) {
        await logoutUser();
      }
    } catch (error) {
      console.error("Error recording logout:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
    }
  };

  const checkPermission = (requiredRole) => {
    if (!user) return false;
    if (requiredRole === "admin") return user.role === "admin";
    return true;
  };

  const value = {
    user,
    loading,
    initialized,
    hasAdmin,
    login,
    register,
    logout,
    checkPermission,
    authError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
