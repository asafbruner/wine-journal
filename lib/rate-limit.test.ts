import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit, resetRateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    // Reset rate limits before each test
    resetRateLimit("test-user");
  });

  it("should allow first request", () => {
    const result = rateLimit("test-user");
    expect(result).toBe(true);
  });

  it("should allow up to 10 requests in window", () => {
    for (let i = 0; i < 10; i++) {
      const result = rateLimit("test-user");
      expect(result).toBe(true);
    }
  });

  it("should block 11th request in window", () => {
    // Make 10 successful requests
    for (let i = 0; i < 10; i++) {
      rateLimit("test-user");
    }
    
    // 11th request should be blocked
    const result = rateLimit("test-user");
    expect(result).toBe(false);
  });

  it("should track different users separately", () => {
    // User 1 makes 10 requests
    for (let i = 0; i < 10; i++) {
      rateLimit("user-1");
    }
    
    // User 1 is blocked
    expect(rateLimit("user-1")).toBe(false);
    
    // User 2 should still be allowed
    expect(rateLimit("user-2")).toBe(true);
  });

  it("should reset after window expires", async () => {
    // Mock timers
    vi.useFakeTimers();
    
    // Make 10 requests
    for (let i = 0; i < 10; i++) {
      rateLimit("test-user");
    }
    
    // Should be blocked
    expect(rateLimit("test-user")).toBe(false);
    
    // Advance time by 61 seconds (past the 60s window)
    vi.advanceTimersByTime(61_000);
    
    // Should be allowed again
    expect(rateLimit("test-user")).toBe(true);
    
    vi.useRealTimers();
  });

  it("should handle resetRateLimit", () => {
    // Make 10 requests
    for (let i = 0; i < 10; i++) {
      rateLimit("test-user");
    }
    
    // Should be blocked
    expect(rateLimit("test-user")).toBe(false);
    
    // Reset
    resetRateLimit("test-user");
    
    // Should be allowed again
    expect(rateLimit("test-user")).toBe(true);
  });

  it("should handle concurrent requests from same user", () => {
    const results = Array.from({ length: 15 }, () => rateLimit("test-user"));
    
    // First 10 should succeed
    expect(results.slice(0, 10).every(r => r === true)).toBe(true);
    
    // Remaining should fail
    expect(results.slice(10).every(r => r === false)).toBe(true);
  });
});
