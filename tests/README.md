# End-to-End Tests for PAKApi

## Overview

This directory contains comprehensive end-to-end (E2E) integration tests for PAKApi Phase 8. These tests validate complete business workflows across the entire system including database tables, Edge Functions, and data integrity.

## Test Structure

```
tests/
├── README.md                    # This file
├── config.ts                    # Test configuration and setup
├── helpers.ts                   # Test helper functions
├── 01_crud_operations_test.ts   # Basic CRUD operations tests
├── 02_billing_flow_test.ts      # Complete billing workflow tests
├── 03_liquidation_flow_test.ts  # Driver liquidation workflow tests
├── 04_reports_test.ts           # Reporting endpoints tests
├── 05_batch_operations_test.ts  # Batch operations tests
└── 06_security_test.ts          # Security and RLS policy tests
```

## Prerequisites

1. **Supabase Project**: A running Supabase project with all migrations applied
2. **Environment Variables**: Configure the following in `.env` file:
   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   SUPABASE_ANON_KEY=your-anon-key
   ```
3. **Deno**: Install Deno runtime (https://deno.land)

## Running Tests

### Run All Tests
```bash
cd /home/runner/work/PAKApi/PAKApi
deno test --allow-net --allow-env --allow-read tests/
```

### Run Specific Test File
```bash
deno test --allow-net --allow-env --allow-read tests/01_crud_operations_test.ts
```

### Run with Verbose Output
```bash
deno test --allow-net --allow-env --allow-read --trace-ops tests/
```

### Run Tests in Sequence (Not Parallel)
```bash
deno test --allow-net --allow-env --allow-read --jobs=1 tests/
```

## Test Categories

### 1. CRUD Operations Tests (`01_crud_operations_test.ts`)
Tests basic Create, Read, Update, Delete operations for all Edge Functions:
- obras-sociales
- pacientes
- conductores
- destinos
- servicios-paciente
- traslados-mensuales
- facturas
- liquidaciones-conductores
- recibos
- horarios-traslados
- gastos-operativos

### 2. Billing Flow Tests (`02_billing_flow_test.ts`)
Tests complete billing workflow:
1. Create patient and configure service
2. Create billing period
3. Record monthly transports
4. Generate invoice with details
5. Process payment and create receipt
6. Verify data integrity across all related tables

### 3. Liquidation Flow Tests (`03_liquidation_flow_test.ts`)
Tests driver liquidation workflow:
1. Create driver and assign to transports
2. Schedule transport appointments
3. Record operational expenses
4. Generate driver liquidation/settlement
5. Process payment
6. Verify calculations and data integrity

### 4. Reports Tests (`04_reports_test.ts`)
Tests all reporting endpoints:
- Annual billing report
- Pending collections report
- Patients by health insurance report
- Monthly profitability report
- Annual summary report
- General dashboard metrics

### 5. Batch Operations Tests (`05_batch_operations_test.ts`)
Tests batch operations for critical endpoints:
- Bulk invoice generation
- Batch payment processing
- Mass update operations
- Bulk data imports

### 6. Security Tests (`06_security_test.ts`)
Tests security policies and access control:
- Row Level Security (RLS) policies
- Authentication requirements
- Authorization checks
- Input validation
- SQL injection prevention

## Test Data Management

### Test Data Cleanup
All tests should clean up their data after completion. Use the helper functions:
```typescript
import { cleanupTestData } from './helpers.ts';

// In your test
Deno.test("My test", async () => {
  const testData = await createTestData();
  try {
    // Run test assertions
  } finally {
    await cleanupTestData(testData);
  }
});
```

### Isolated Test Data
Each test creates its own isolated test data with unique identifiers to prevent interference between tests.

## Best Practices

1. **Use Transaction-like Patterns**: Create test data at the start, clean up in finally blocks
2. **Unique Identifiers**: Use UUIDs and timestamps to ensure data uniqueness
3. **Idempotent Tests**: Tests should be runnable multiple times without side effects
4. **Comprehensive Assertions**: Verify not just success, but data correctness
5. **Error Handling**: Test both success and failure scenarios
6. **Performance**: Keep tests fast by using efficient queries and minimal data

## Troubleshooting

### Connection Errors
- Verify `SUPABASE_URL` is correct
- Check network connectivity
- Ensure Supabase project is running

### Authentication Errors
- Verify `SUPABASE_SERVICE_KEY` is correct
- Check that RLS policies are properly configured
- Ensure migrations are applied

### Test Failures
- Check Supabase logs for errors
- Verify all migrations are applied
- Ensure Edge Functions are deployed
- Check test data cleanup

### Timeout Errors
- Increase timeout in Deno test config
- Check database performance
- Verify Edge Functions are responding

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: denoland/setup-deno@v1
      - name: Run E2E Tests
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: deno test --allow-net --allow-env --allow-read tests/
```

## Contributing

When adding new tests:
1. Follow existing test structure and patterns
2. Add comprehensive assertions
3. Include both success and failure test cases
4. Update this README with new test descriptions
5. Ensure tests clean up their data
6. Document any special requirements or setup

## Support

For issues or questions:
1. Check test logs for detailed error messages
2. Review Supabase function logs
3. Verify database state using SQL queries
4. Create an issue in the repository with test output

## Test Coverage

Current test coverage includes:
- ✅ All CRUD operations for 11 Edge Functions
- ✅ Complete billing workflow (5+ steps)
- ✅ Complete liquidation workflow (5+ steps)
- ✅ All 6 reporting endpoints
- ✅ Batch operations for critical entities
- ✅ Security policies and access control

**Total Tests**: ~100+ test cases across 6 test files
**Estimated Runtime**: 2-5 minutes for full test suite
