# Database Schema Tests

## Summary

Tests added to prevent the "location column missing" issue from recurring.

## ✅ Unit Tests (Passing)

**File**: `src/services/__tests__/wineService.schema.test.ts`

These tests verify:
- ✅ Location field is included when adding wine
- ✅ Wines can be added without location field (nullable)
- ✅ All schema fields are present in API responses
- ✅ Clear error messages for database schema issues

**Run with**: `npm test -- wineService.schema.test.ts --run`

**Results**: ✅ All 4 tests passing

## E2E Tests (Integration)

**Files**: 
- `tests/e2e/database-schema.spec.ts`
- `tests/e2e/database-migration.spec.ts`

These tests verify:
- Database schema includes location column
- Migration is idempotent (can run multiple times)
- All wine fields work correctly in real API calls
- Error handling for missing required fields

**Run with**: `npx playwright test tests/e2e/database-schema.spec.ts --project=chromium`

**Note**: E2E tests require:
1. Database to be initialized (`POST /api/init-db`)
2. Auth system working properly
3. Local dev server or production environment

## What These Tests Prevent

### Issue Fixed
**Error**: `column "location" of relation "wines" does not exist`

This occurred when the database schema was created before the `location` column was added to the code.

### Prevention
1. **Unit tests** verify the WineService includes location in API calls
2. **E2E tests** verify the database actually has the column
3. **Migration tests** ensure `init-db` adds missing columns safely

## Database Migration

The `api/init-db.ts` file now includes:

```typescript
// Add location column if it doesn't exist (migration)
await sql`
  DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='wines' AND column_name='location'
    ) THEN
      ALTER TABLE wines ADD COLUMN location TEXT;
    END IF;
  END $$;
`;
```

This migration:
- ✅ Adds `location` column if missing
- ✅ Is idempotent (safe to run multiple times)
- ✅ Doesn't error if column already exists

## Running All Tests

```bash
# Unit tests only
npm test -- wineService.schema --run

# E2E tests (requires database)
npx playwright test tests/e2e/database-schema.spec.ts

# All tests
npm test && npm run test:e2e
```

## Continuous Integration

Add to your CI pipeline:

```yaml
- name: Run schema validation tests
  run: npm test -- wineService.schema.test.ts --run
```

This ensures the schema stays consistent across all environments.

