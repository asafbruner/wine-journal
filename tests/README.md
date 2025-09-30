# Testing Guide

This project has comprehensive test coverage using **Vitest** for unit and integration tests, and **Playwright** for E2E tests.

## Quick Start

```bash
# Run all unit/integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run e2e

# Run E2E tests in UI mode
npm run e2e:ui
```

## Test Structure

### Unit Tests (`lib/*.test.ts`)
Fast, isolated tests for utility functions:
- **`lib/utils.test.ts`** - CSS class merging utilities
- **`lib/csv.test.ts`** - CSV generation
- **`lib/search.test.ts`** - Search parameter parsing
- **`lib/rate-limit.test.ts`** - Rate limiting logic
- **`lib/validation.test.ts`** - Form validation schemas

### Integration Tests (`app/api/**/*.test.ts`)
Tests for API routes with mocked dependencies:
- **`app/api/ai/route.test.ts`** - AI summary generation endpoint
- **`app/export/route.test.ts`** - CSV export endpoint

### E2E Tests (`e2e/*.spec.ts`)
Browser-based tests for user workflows:
- **`e2e/dashboard.spec.ts`** - Dashboard and authentication
- **`e2e/wines.spec.ts`** - Wine management
- **`e2e/tastings.spec.ts`** - Tasting notes
- **`e2e/accessibility.spec.ts`** - A11y compliance
- **`e2e/performance.spec.ts`** - Performance benchmarks

## Configuration

### Vitest (`vitest.config.ts`)
- ⚡ Parallel execution with threads
- 🎯 10 concurrent threads maximum
- 📊 V8 coverage provider
- ⏱️ 10 second timeout per test

### Playwright (`playwright.config.ts`)
- 🌐 Chromium browser (Firefox/Safari available)
- 🔄 Parallel test execution
- 📸 Screenshots on failure
- 🔍 Traces on retry
- 🚀 Auto-starts dev server

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from "vitest";
import { myFunction } from "./my-function";

describe("myFunction", () => {
  it("should do something", () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth");

describe("POST /api/endpoint", () => {
  it("should handle request", async () => {
    const request = new Request("http://localhost/api/endpoint", {
      method: "POST",
      body: JSON.stringify({ data: "test" }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from "@playwright/test";

test("should navigate to page", async ({ page }) => {
  await page.goto("/wines");
  await expect(page.getByRole("heading", { name: /wines/i })).toBeVisible();
});
```

## Performance

### Fast Test Execution
- Unit tests run in **parallel** across multiple threads
- Tests are **isolated** but share the same process for speed
- Average unit test suite completes in **< 5 seconds**

### E2E Tests
- Run in parallel across multiple browsers
- Only essential flows are tested to maintain speed
- Average E2E suite completes in **< 2 minutes**

## CI/CD

Tests run automatically on:
- Every pull request
- Every push to main branch
- Pre-commit (via Husky)

## Coverage

Generate coverage report:
```bash
npm run test:coverage
```

View coverage report:
```bash
open coverage/index.html
```

## Best Practices

1. **Keep tests fast** - Unit tests should complete in milliseconds
2. **Test behavior, not implementation** - Focus on inputs/outputs
3. **Use descriptive names** - Tests should read like documentation
4. **Mock external dependencies** - Database, APIs, file system
5. **Avoid test interdependence** - Each test should be isolated
6. **Test error cases** - Don't just test the happy path

## Troubleshooting

### Tests failing locally but passing in CI
- Clear cache: `rm -rf node_modules/.vitest`
- Check Node version matches CI
- Ensure all dependencies are installed

### E2E tests timing out
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify network conditions

### Flaky E2E tests
- Add explicit waits: `await page.waitForLoadState("networkidle")`
- Use `toBeVisible()` instead of checking DOM directly
- Avoid hard-coded delays

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
