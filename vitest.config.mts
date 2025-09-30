import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Run tests in parallel for speed
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        useAtomics: true,
      },
    },
    // Maximum number of threads
    maxConcurrency: 10,
    
    // Faster test execution
    isolate: true,
    
    // Test patterns
    include: ["lib/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".next", "e2e", "tests/setup.ts", "tests/README.md"],
    
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["lib/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/",
        "**/*.config.*",
        "**/*.d.ts",
        "**/types/**",
        "**/__tests__/**",
        "**/*.test.*",
        "**/*.spec.*",
        ".next/",
        "prisma/",
      ],
    },
    
    // Environment
    environment: "node",
    
    // Global test timeout
    testTimeout: 10000,
    
    // Setup files
    setupFiles: ["./tests/setup.ts"],
  },
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
