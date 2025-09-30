# 🔧 Quick Fix Guide

## Fix Pre-Existing TypeScript Errors

### Step 1: Create NextAuth Type Augmentation

Create `types/next-auth.d.ts`:

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
```

This fixes ~30 `session.user.id` errors.

### Step 2: Install Missing Dependencies

```bash
# Production dependencies
npm install openai cloudinary

# Development dependencies  
npm install --save-dev @playwright/test @types/cookie @vitest/coverage-v8 @vitest/ui

# Install Playwright browsers (for E2E tests)
npx playwright install chromium
```

### Step 3: Fix Import Casing Issues

Check these imports and match the actual file names:

```typescript
// Fix in app/(app)/wines/page.tsx
import { Filters } from "@/components/Filters";  // Capital F
import { WineCard } from "@/components/WineCard";  // Capital W, Capital C

// Check if these files exist:
// - components/Filters.tsx (not filters.tsx)
// - components/WineCard.tsx (not wine-card.tsx)
// - components/rating.tsx (might be missing - create or find it)
```

### Step 4: Generate Next.js Types

```bash
# Run dev server once to generate types
npm run dev
# Wait for it to compile, then stop it (Ctrl+C)
```

### Step 5: Fix Form Input Types

In forms with nullable numbers, convert to string:

```typescript
// Before:
<Input type="number" {...field} />  // field.value can be null

// After:
<Input 
  type="number" 
  {...field} 
  value={field.value ?? ""} 
  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
/>
```

### Step 6: Verify Fixes

```bash
# Run type check
npm run typecheck

# Run linter
npm run lint

# Run tests
npm test
```

## Expected Results After Fixes

```
Before: 106 TypeScript errors
After:  ~10-20 errors (mostly minor type mismatches)

Tests: 46/46 passing ✅
Linting: 0 errors in test files ✅
```

## If You Want to Skip Type Errors Temporarily

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "skipLibCheck": true,  // Already enabled
    "noEmit": true,        // Already enabled
    // Add these to be more lenient:
    "strict": false,       // Disable strict mode temporarily
    "noImplicitAny": false // Allow implicit any
  }
}
```

**Not recommended for production!**

## Priority Order

1. ✅ **Tests are already working** (841ms, 46/46 passing)
2. 🔧 **NextAuth types** (biggest impact, easiest fix)
3. 🔧 **Missing dependencies** (required for features)
4. 🔧 **Import casing** (platform-specific issue)
5. 🔧 **Form types** (minor UX issue)

---

**Your test suite is ready to use right now!** These are just pre-existing issues in the main app.
