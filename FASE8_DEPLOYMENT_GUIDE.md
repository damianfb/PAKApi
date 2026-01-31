# FASE 8 - Production Deployment Guide

## Overview

This comprehensive guide covers the complete deployment process for PAKApi to production, including database migrations, Edge Functions deployment, environment configuration, monitoring setup, and rollback procedures.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Deployment](#database-deployment)
4. [Edge Functions Deployment](#edge-functions-deployment)
5. [Post-Deployment Validation](#post-deployment-validation)
6. [Monitoring and Alerting](#monitoring-and-alerting)
7. [Backup and Restore](#backup-and-restore)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Review
- [ ] All code changes reviewed and approved
- [ ] Tests passing (run `deno test --allow-net --allow-env --allow-read tests/`)
- [ ] No security vulnerabilities identified
- [ ] Documentation updated

### Database
- [ ] All migrations tested in staging environment
- [ ] Database backup created
- [ ] Migration scripts validated (SQL syntax)
- [ ] Rollback scripts prepared

### Edge Functions
- [ ] All functions tested locally
- [ ] TypeScript code compiles without errors
- [ ] Dependencies versions locked
- [ ] CORS configuration reviewed

### Environment
- [ ] Production Supabase project created
- [ ] Environment variables documented
- [ ] Secrets configured in Supabase
- [ ] Access credentials secured

### Testing
- [ ] Unit tests pass (if applicable)
- [ ] Integration tests pass
- [ ] E2E tests pass in staging
- [ ] Load testing completed (if applicable)

---

## Environment Setup

### 1. Create Supabase Project

```bash
# Login to Supabase
supabase login

# Initialize project (if not already done)
supabase init

# Link to production project
supabase link --project-ref YOUR_PRODUCTION_PROJECT_REF
```

### 2. Configure Environment Variables

Create `.env.production` file (DO NOT commit to git):

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres

# Application
NODE_ENV=production
API_VERSION=1.0.0

# Optional: External Services
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your-smtp-user
# SMTP_PASS=your-smtp-password
```

### 3. Set Supabase Secrets

```bash
# Set secrets for Edge Functions
supabase secrets set --env-file .env.production

# Or set individual secrets
supabase secrets set API_KEY=your-api-key
supabase secrets set WEBHOOK_SECRET=your-webhook-secret

# Verify secrets
supabase secrets list
```

---

## Database Deployment

### 1. Backup Current Database

```bash
# Create backup before migration
pg_dump "postgresql://postgres:[PASSWORD]@db.your-project.supabase.co:5432/postgres" \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Or using Supabase CLI
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Apply Migrations in Order

```bash
# Check migration status
supabase migration list

# Apply all pending migrations
supabase db push

# Or apply specific migration
psql $DATABASE_URL < supabase/migrations/00001_create_base_tables.sql
```

**Migration Order** (must be applied in sequence):

1. `00001_create_base_tables.sql` - FASE 1 tables (obras_sociales, pacientes, conductores, destinos)
2. `00002_seed_initial_data.sql` - Initial seed data
3. `00003_create_fase2_tables.sql` - FASE 2 tables (servicios_paciente, periodos_facturacion, traslados_mensuales)
4. `00004_create_fase3_tables.sql` - FASE 3 tables (facturas, facturas_detalle, notas_credito)
5. `00005_create_fase4_tables.sql` - FASE 4 tables (cobranzas, recibos, recibos_detalle)
6. `00006_create_fase5_tables.sql` - FASE 5 tables (horarios_traslados)
7. `00007_create_fase6_tables.sql` - FASE 6 tables (gastos_operativos, liquidaciones_conductores)
8. `00008_create_fase7_reporting_views.sql` - FASE 7 reporting views

### 3. Verify Database Schema

```bash
# Connect to database
psql $DATABASE_URL

# Verify tables
\dt

# Verify views
\dv

# Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

# Check specific table structure
\d pacientes
\d facturas
```

### 4. Verify Indexes

```sql
-- Check indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

---

## Edge Functions Deployment

### 1. Prepare Functions for Deployment

```bash
# Navigate to project root
cd /path/to/PAKApi

# Verify function structure
ls -la supabase/functions/

# Check Deno configuration
cat supabase/functions/deno.json
```

### 2. Deploy All Edge Functions

```bash
# Deploy all functions at once
for func in obras-sociales pacientes destinos conductores servicios-paciente \
            traslados-mensuales facturas liquidaciones-conductores recibos \
            horarios-traslados gastos-operativos reportes; do
  echo "Deploying $func..."
  supabase functions deploy $func --no-verify-jwt
done
```

### 3. Deploy Individual Functions

```bash
# Deploy specific function
supabase functions deploy obras-sociales

# Deploy with specific import map
supabase functions deploy obras-sociales --import-map supabase/functions/deno.json

# Deploy without JWT verification (for testing only)
supabase functions deploy obras-sociales --no-verify-jwt
```

### 4. Verify Deployments

```bash
# List all deployed functions
supabase functions list

# Check function status
curl -X GET "https://your-project.supabase.co/functions/v1/obras-sociales" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}"
```

**Expected Functions** (11 total):

- `obras-sociales` - Health insurance CRUD
- `pacientes` - Patients CRUD
- `conductores` - Drivers CRUD
- `destinos` - Destinations CRUD
- `servicios-paciente` - Patient services CRUD
- `traslados-mensuales` - Monthly transports CRUD
- `facturas` - Invoices CRUD
- `liquidaciones-conductores` - Driver settlements CRUD
- `recibos` - Receipts CRUD
- `horarios-traslados` - Transport schedules CRUD
- `gastos-operativos` - Operational expenses CRUD
- `reportes` - Reporting and dashboard endpoints

---

## Post-Deployment Validation

### 1. Database Validation

```sql
-- Check record counts
SELECT 
    'obras_sociales' as table_name, COUNT(*) as count FROM obras_sociales
UNION ALL
SELECT 'pacientes', COUNT(*) FROM pacientes
UNION ALL
SELECT 'conductores', COUNT(*) FROM conductores
UNION ALL
SELECT 'destinos', COUNT(*) FROM destinos;

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check views
SELECT * FROM vista_dashboard_general;
```

### 2. Edge Functions Validation

```bash
# Test CRUD operations
./test_edge_functions.sh

# Or test individual endpoints
export SUPABASE_URL="https://your-project.supabase.co"
export JWT_TOKEN="your-jwt-token"

# Test GET
curl -X GET "${SUPABASE_URL}/functions/v1/pacientes" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Test POST
curl -X POST "${SUPABASE_URL}/functions/v1/pacientes" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test", "apellido": "Test", "dni": "12345678"}'
```

### 3. Run E2E Tests

```bash
# Set production environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-key"

# Run E2E tests
deno test --allow-net --allow-env --allow-read tests/

# Run specific test file
deno test --allow-net --allow-env --allow-read tests/01_crud_operations_test.ts
```

### 4. Smoke Tests

Quick validation checklist:

- [ ] Can create a new paciente (POST /pacientes)
- [ ] Can list all pacientes (GET /pacientes)
- [ ] Can get single paciente by ID (GET /pacientes/:id)
- [ ] Can update paciente (PUT /pacientes/:id)
- [ ] Can delete paciente (DELETE /pacientes/:id)
- [ ] Reports endpoint returns data (GET /reportes/dashboard)
- [ ] Authentication is enforced (test without JWT - should fail)

---

## Monitoring and Alerting

### 1. Enable Supabase Monitoring

1. Go to Supabase Dashboard → Project Settings → Integrations
2. Enable monitoring services (if available)
3. Configure log retention

### 2. Function Logs

```bash
# View function logs
supabase functions logs obras-sociales

# Follow logs in real-time
supabase functions logs obras-sociales --follow

# Filter logs by time
supabase functions logs obras-sociales --since=1h
```

### 3. Database Metrics

Monitor in Supabase Dashboard:
- Query performance
- Connection pool usage
- Storage usage
- Active connections

### 4. Custom Monitoring (Optional)

Create monitoring table:

```sql
CREATE TABLE api_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_metrics_endpoint ON api_metrics(endpoint);
CREATE INDEX idx_api_metrics_timestamp ON api_metrics(timestamp DESC);
```

Add to Edge Functions:

```typescript
// Log API call
const startTime = Date.now();
try {
  // ... function logic ...
  const responseTime = Date.now() - startTime;
  await logMetric(endpoint, method, 200, responseTime);
} catch (error) {
  const responseTime = Date.now() - startTime;
  await logMetric(endpoint, method, 500, responseTime);
}
```

### 5. Alert Configuration

Set up alerts for:
- Function errors (> 5 errors in 5 minutes)
- High response times (> 2 seconds)
- Failed authentications (> 10 in 1 minute)
- Database connection errors
- Storage approaching limits

---

## Backup and Restore

### 1. Automated Backups

**Supabase provides automatic daily backups**:
- Backups retained for 7 days (Free plan)
- Point-in-time recovery available (Pro plan)

### 2. Manual Backup

```bash
# Full database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific tables
pg_dump $DATABASE_URL \
  -t pacientes -t facturas -t recibos \
  > backup_critical_$(date +%Y%m%d_%H%M%S).sql

# Backup with compression
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 3. Restore from Backup

```bash
# Restore full database
psql $DATABASE_URL < backup_20260131_120000.sql

# Restore with gunzip
gunzip -c backup_20260131_120000.sql.gz | psql $DATABASE_URL

# Restore to specific point in time (Pro plan)
# Use Supabase Dashboard → Database → Backups
```

### 4. Backup Strategy

**Recommended schedule**:
- **Hourly**: Transaction logs (if critical)
- **Daily**: Full database backup (automated by Supabase)
- **Weekly**: Archive backup to external storage
- **Monthly**: Long-term retention backup

**Backup storage**:
- Keep local copies for quick recovery
- Store in cloud storage (S3, GCS, etc.)
- Test restore procedure monthly

---

## Rollback Procedures

### 1. Rollback Edge Functions

```bash
# List function versions
supabase functions list

# Deploy previous version
supabase functions deploy obras-sociales --version previous

# Or redeploy from git
git checkout previous-commit
supabase functions deploy obras-sociales
```

### 2. Rollback Database Migrations

**Option 1: Restore from backup**

```bash
# Stop application (prevent new connections)
# Restore database
psql $DATABASE_URL < backup_before_migration.sql
```

**Option 2: Run rollback migration**

Create `00009_rollback_fase8.sql`:

```sql
-- Rollback example: drop new tables or features
DROP TABLE IF EXISTS new_table;
DROP VIEW IF EXISTS new_view;
-- Restore previous version of modified tables
-- (if you kept backup columns/tables)
```

### 3. Emergency Rollback Checklist

1. **Stop traffic** (if possible, use maintenance mode)
2. **Identify issue** (check logs, metrics, error reports)
3. **Decide rollback scope** (full or partial)
4. **Execute rollback**:
   - Database: Restore from backup OR run rollback migration
   - Functions: Deploy previous version
5. **Verify** system is stable
6. **Investigate** root cause
7. **Document** incident and resolution

---

## Troubleshooting

### Common Issues

#### 1. Function Deployment Fails

```bash
# Error: "Function not found"
# Solution: Check function name and directory structure
ls supabase/functions/

# Error: "Import map not found"
# Solution: Verify deno.json exists
cat supabase/functions/deno.json

# Error: "TypeScript compilation failed"
# Solution: Check for syntax errors
deno check supabase/functions/obras-sociales/index.ts
```

#### 2. Database Connection Errors

```bash
# Check connection string
psql $DATABASE_URL -c "SELECT version();"

# Check connection pool
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

# Check for locks
SELECT * FROM pg_locks WHERE NOT granted;
```

#### 3. Authentication Errors

```bash
# Test JWT token
curl -X GET "${SUPABASE_URL}/functions/v1/pacientes" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -v

# Verify token hasn't expired
# JWT tokens typically expire after 1 hour

# Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'pacientes';
```

#### 4. Performance Issues

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100
AND correlation < 0.1;
```

#### 5. CORS Errors

Check CORS configuration in `_shared/cors.ts`:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};
```

---

## Production Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Database backup created
- [ ] Staging environment tested
- [ ] Deployment plan documented
- [ ] Rollback plan prepared
- [ ] Team notified of deployment

### During Deployment
- [ ] Maintenance mode enabled (if applicable)
- [ ] Database migrations applied
- [ ] Edge Functions deployed
- [ ] Environment variables configured
- [ ] Secrets set
- [ ] Post-deployment tests run
- [ ] Monitoring verified

### Post-Deployment
- [ ] All services responding
- [ ] Key features tested manually
- [ ] E2E tests passing
- [ ] Logs checked for errors
- [ ] Performance metrics normal
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team notified of completion

### 24 Hours After
- [ ] Monitor for errors
- [ ] Check performance metrics
- [ ] Review logs
- [ ] Collect user feedback
- [ ] Document lessons learned

---

## Support and Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Deno Documentation](https://deno.land/manual)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Monitoring
- Supabase Dashboard: [dashboard.supabase.com](https://dashboard.supabase.com)
- Function Logs: `supabase functions logs {function-name}`
- Database Metrics: Supabase Dashboard → Database

### Emergency Contacts
- **Database Issues**: DBA Team
- **Application Issues**: Development Team
- **Infrastructure**: DevOps Team

---

## Deployment Timeline Example

**Total Time: ~2-3 hours**

| Time | Task | Duration |
|------|------|----------|
| T-60min | Pre-deployment checklist | 30 min |
| T-30min | Create database backup | 15 min |
| T-15min | Final team sync | 15 min |
| T | Begin deployment | - |
| T+10min | Apply database migrations | 10 min |
| T+25min | Deploy Edge Functions | 15 min |
| T+35min | Run post-deployment tests | 10 min |
| T+50min | Smoke testing | 15 min |
| T+60min | Monitor for issues | 30+ min |

---

## Conclusion

Following this deployment guide ensures a smooth, secure, and reliable deployment of PAKApi to production. Always test thoroughly in staging before deploying to production, and maintain comprehensive backups.

**Remember**: 
- Test in staging first
- Always have a rollback plan
- Monitor after deployment
- Document everything

For questions or issues, refer to the project documentation or contact the development team.
