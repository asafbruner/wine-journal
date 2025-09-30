import { beforeAll, afterAll, afterEach } from "vitest";

// Mock environment variables for tests
beforeAll(() => {
  process.env.DATABASE_URL = "file:./test.db";
  process.env.NEXTAUTH_URL = "http://localhost:3000";
  process.env.NEXTAUTH_SECRET = "test-secret-key-for-testing-only";
  process.env.OPENAI_API_KEY = "test-api-key";
});

// Cleanup after all tests
afterAll(() => {
  // Add any global cleanup here
});

// Reset mocks after each test
afterEach(() => {
  // Add per-test cleanup here
});
