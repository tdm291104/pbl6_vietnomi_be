// Setup file for Jest tests
// This file is loaded before all tests

// Initialize global test case details array
if (!global.testCaseDetails) {
  global.testCaseDetails = [];
  console.log('✅ Global testCaseDetails initialized in setup.js');
}

// Add a beforeEach hook to ensure the array exists
beforeEach(() => {
  if (!global.testCaseDetails) {
    global.testCaseDetails = [];
  }
});

// Log when setup is loaded
console.log('🚀 Test setup.js loaded successfully');
