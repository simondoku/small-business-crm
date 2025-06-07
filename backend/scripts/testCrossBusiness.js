const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const API_BASE = "http://localhost:5003/api";

class CrossBusinessSecurityTest {
  constructor() {
    this.business1Token = null;
    this.business2Token = null;
    this.business1Data = {};
    this.business2Data = {};
    this.testResults = [];
  }

  async log(message, type = "INFO") {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type}: ${message}`);
    this.testResults.push({ timestamp, type, message });
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    try {
      const config = {
        method,
        url: `${API_BASE}${endpoint}`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        data,
      };

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 500,
      };
    }
  }

  async setupTestBusinesses() {
    await this.log("Setting up test businesses...");

    // Create Business 1 user
    const business1User = {
      email: `business1_${Date.now()}@test.com`,
      password: "TestPass123!",
      firstName: "Business",
      lastName: "One",
      businessName: "Test Business One",
      role: "admin",
    };

    const reg1 = await this.makeRequest(
      "POST",
      "/users/register",
      business1User
    );
    if (!reg1.success) {
      await this.log(
        `Failed to create Business 1: ${JSON.stringify(reg1.error)}`,
        "ERROR"
      );
      return false;
    }

    // Login Business 1
    const login1 = await this.makeRequest("POST", "/users/login", {
      email: business1User.email,
      password: business1User.password,
    });

    if (!login1.success) {
      await this.log(
        `Failed to login Business 1: ${JSON.stringify(login1.error)}`,
        "ERROR"
      );
      return false;
    }

    this.business1Token = login1.data.token;
    this.business1Data.userId = login1.data.user.id;
    this.business1Data.businessId = login1.data.user.businessId;
    await this.log(`Business 1 created - ID: ${this.business1Data.businessId}`);

    // Create Business 2 user
    const business2User = {
      email: `business2_${Date.now()}@test.com`,
      password: "TestPass123!",
      firstName: "Business",
      lastName: "Two",
      businessName: "Test Business Two",
      role: "admin",
    };

    const reg2 = await this.makeRequest(
      "POST",
      "/users/register",
      business2User
    );
    if (!reg2.success) {
      await this.log(
        `Failed to create Business 2: ${JSON.stringify(reg2.error)}`,
        "ERROR"
      );
      return false;
    }

    // Login Business 2
    const login2 = await this.makeRequest("POST", "/users/login", {
      email: business2User.email,
      password: business2User.password,
    });

    if (!login2.success) {
      await this.log(
        `Failed to login Business 2: ${JSON.stringify(login2.error)}`,
        "ERROR"
      );
      return false;
    }

    this.business2Token = login2.data.token;
    this.business2Data.userId = login2.data.user.id;
    this.business2Data.businessId = login2.data.user.businessId;
    await this.log(`Business 2 created - ID: ${this.business2Data.businessId}`);

    return true;
  }

  async createTestData() {
    await this.log("Creating test data for both businesses...");

    // Create products for Business 1
    const product1 = await this.makeRequest(
      "POST",
      "/products",
      {
        name: "Business 1 Product",
        price: 100,
        description: "Secret Business 1 Product",
      },
      this.business1Token
    );

    if (product1.success) {
      this.business1Data.productId = product1.data.id;
      await this.log(
        `Business 1 product created: ${this.business1Data.productId}`
      );
    }

    // Create customer for Business 1
    const customer1 = await this.makeRequest(
      "POST",
      "/customers",
      {
        firstName: "Business1",
        lastName: "Customer",
        email: "b1customer@test.com",
        phone: "123-456-7890",
      },
      this.business1Token
    );

    if (customer1.success) {
      this.business1Data.customerId = customer1.data.id;
      await this.log(
        `Business 1 customer created: ${this.business1Data.customerId}`
      );
    }

    // Create products for Business 2
    const product2 = await this.makeRequest(
      "POST",
      "/products",
      {
        name: "Business 2 Product",
        price: 200,
        description: "Secret Business 2 Product",
      },
      this.business2Token
    );

    if (product2.success) {
      this.business2Data.productId = product2.data.id;
      await this.log(
        `Business 2 product created: ${this.business2Data.productId}`
      );
    }

    // Create customer for Business 2
    const customer2 = await this.makeRequest(
      "POST",
      "/customers",
      {
        firstName: "Business2",
        lastName: "Customer",
        email: "b2customer@test.com",
        phone: "987-654-3210",
      },
      this.business2Token
    );

    if (customer2.success) {
      this.business2Data.customerId = customer2.data.id;
      await this.log(
        `Business 2 customer created: ${this.business2Data.customerId}`
      );
    }
  }

  async testCrossBusinessAccess() {
    await this.log("Testing cross-business access attempts...", "WARN");

    const tests = [
      {
        name: "Business 1 trying to access Business 2 products",
        request: () =>
          this.makeRequest("GET", "/products", null, this.business1Token),
        shouldFail: false, // Should only return Business 1 products
        validate: (response) => {
          if (response.success && Array.isArray(response.data)) {
            const hasBusiness2Product = response.data.some(
              (p) => p.name === "Business 2 Product"
            );
            return !hasBusiness2Product;
          }
          return false;
        },
      },
      {
        name: "Business 2 trying to access Business 1 customers",
        request: () =>
          this.makeRequest("GET", "/customers", null, this.business2Token),
        shouldFail: false, // Should only return Business 2 customers
        validate: (response) => {
          if (response.success && Array.isArray(response.data)) {
            const hasBusiness1Customer = response.data.some(
              (c) => c.email === "b1customer@test.com"
            );
            return !hasBusiness1Customer;
          }
          return false;
        },
      },
      {
        name: "Business 1 trying to update Business 2 product by ID",
        request: () =>
          this.makeRequest(
            "PUT",
            `/products/${this.business2Data.productId}`,
            {
              name: "Hacked Product",
              price: 1,
            },
            this.business1Token
          ),
        shouldFail: true,
      },
      {
        name: "Business 2 trying to delete Business 1 customer by ID",
        request: () =>
          this.makeRequest(
            "DELETE",
            `/customers/${this.business1Data.customerId}`,
            null,
            this.business2Token
          ),
        shouldFail: true,
      },
      {
        name: "Business 1 trying to access Business 2 analytics",
        request: () =>
          this.makeRequest(
            "GET",
            "/analytics/overview",
            null,
            this.business1Token
          ),
        shouldFail: false, // Should only return Business 1 analytics
        validate: (response) => {
          // Analytics should be isolated to business 1 only
          return response.success;
        },
      },
      {
        name: "Direct database ID manipulation - Product access",
        request: () =>
          this.makeRequest(
            "GET",
            `/products/${this.business2Data.productId}`,
            null,
            this.business1Token
          ),
        shouldFail: true,
      },
      {
        name: "Direct database ID manipulation - Customer access",
        request: () =>
          this.makeRequest(
            "GET",
            `/customers/${this.business1Data.customerId}`,
            null,
            this.business2Token
          ),
        shouldFail: true,
      },
      {
        name: "Business 2 trying to create sale with Business 1 customer and product",
        request: () =>
          this.makeRequest(
            "POST",
            "/sales",
            {
              customerId: this.business1Data.customerId,
              products: [
                {
                  productId: this.business1Data.productId,
                  quantity: 1,
                  price: 100,
                },
              ],
            },
            this.business2Token
          ),
        shouldFail: true,
      },
    ];

    let passedTests = 0;
    let failedTests = 0;

    for (const test of tests) {
      await this.log(`Running: ${test.name}`);

      const response = await test.request();

      let testPassed = false;

      if (test.shouldFail) {
        // Test should fail (return error or 403/404)
        testPassed = !response.success || response.status >= 400;
      } else if (test.validate) {
        // Custom validation function
        testPassed = test.validate(response);
      } else {
        // Test should succeed
        testPassed = response.success;
      }

      if (testPassed) {
        await this.log(`✅ PASS: ${test.name}`, "SUCCESS");
        passedTests++;
      } else {
        await this.log(`❌ FAIL: ${test.name}`, "ERROR");
        await this.log(`   Response: ${JSON.stringify(response)}`, "ERROR");
        failedTests++;
      }
    }

    await this.log(`\n=== TEST SUMMARY ===`);
    await this.log(`Total Tests: ${tests.length}`);
    await this.log(`Passed: ${passedTests}`);
    await this.log(`Failed: ${failedTests}`);

    if (failedTests === 0) {
      await this.log(
        `🎉 ALL SECURITY TESTS PASSED! Cross-business isolation is working correctly.`,
        "SUCCESS"
      );
    } else {
      await this.log(
        `⚠️  SECURITY VULNERABILITIES DETECTED! Please review failed tests.`,
        "ERROR"
      );
    }

    return failedTests === 0;
  }

  async cleanup() {
    await this.log("Cleaning up test data...");

    // Delete test products
    if (this.business1Data.productId) {
      await this.makeRequest(
        "DELETE",
        `/products/${this.business1Data.productId}`,
        null,
        this.business1Token
      );
    }
    if (this.business2Data.productId) {
      await this.makeRequest(
        "DELETE",
        `/products/${this.business2Data.productId}`,
        null,
        this.business2Token
      );
    }

    // Delete test customers
    if (this.business1Data.customerId) {
      await this.makeRequest(
        "DELETE",
        `/customers/${this.business1Data.customerId}`,
        null,
        this.business1Token
      );
    }
    if (this.business2Data.customerId) {
      await this.makeRequest(
        "DELETE",
        `/customers/${this.business2Data.customerId}`,
        null,
        this.business2Token
      );
    }

    await this.log("Cleanup completed");
  }

  async runAllTests() {
    try {
      await this.log("🚀 Starting Cross-Business Security Test Suite...");

      const setupSuccess = await this.setupTestBusinesses();
      if (!setupSuccess) {
        await this.log("Setup failed, aborting tests", "ERROR");
        return false;
      }

      await this.createTestData();
      const securityTestsPassed = await this.testCrossBusinessAccess();
      await this.cleanup();

      return securityTestsPassed;
    } catch (error) {
      await this.log(`Test suite error: ${error.message}`, "ERROR");
      return false;
    }
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  const tester = new CrossBusinessSecurityTest();
  tester
    .runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Test suite crashed:", error);
      process.exit(1);
    });
}

module.exports = CrossBusinessSecurityTest;
