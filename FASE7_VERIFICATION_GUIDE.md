# Phase 7 Verification and Testing Guide

## Overview
This document provides verification steps and testing procedures for Phase 7 (Fase 7) implementation in PAKApi.

---

## Pre-Deployment Verification

### 1. Check Files Created ✅

```bash
# Verify database migration exists
ls -lh supabase/migrations/00008_create_fase7_reporting_views.sql

# Verify Edge Function exists
ls -lh supabase/functions/reportes/index.ts

# Verify documentation exists
ls -lh FASE7_COMPLETE_DOCUMENTATION.md FASE7_SUMMARY.md

# Expected output: All files should exist
```

### 2. Verify Database Migration Syntax

```bash
# Check SQL syntax (optional - requires PostgreSQL client)
psql --dry-run < supabase/migrations/00008_create_fase7_reporting_views.sql

# Or use Supabase CLI to validate
supabase db lint
```

### 3. Verify Edge Function Structure

```bash
# Check TypeScript syntax
cd supabase/functions/reportes
deno check index.ts

# Or use Supabase CLI
cd /home/runner/work/PAKApi/PAKApi
supabase functions serve reportes
```

---

## Deployment Steps

### Step 1: Apply Database Migration

```bash
# Option A: Using Supabase CLI (recommended)
supabase db push

# Option B: Using psql directly
psql $DATABASE_URL -f supabase/migrations/00008_create_fase7_reporting_views.sql

# Verify views were created
psql $DATABASE_URL -c "\dv vista_*"
```

**Expected Result:**
```
List of relations
Schema | Name                        | Type | Owner
-------|-----------------------------|----- |-------
public | vista_cobranzas_pendientes  | view | postgres
public | vista_dashboard_general     | view | postgres
public | vista_facturacion_anual     | view | postgres
public | vista_pacientes_obra_social | view | postgres
public | vista_rentabilidad_mensual  | view | postgres
public | vista_resumen_anual         | view | postgres
```

### Step 2: Deploy Edge Function

```bash
# Deploy the reportes function
supabase functions deploy reportes

# Verify deployment
supabase functions list
```

**Expected Result:**
```
NAME                 | SLUG                 | VERSION | STATUS
---------------------|----------------------|---------|--------
obras-sociales       | obras-sociales       | 1       | ACTIVE
pacientes            | pacientes            | 1       | ACTIVE
destinos             | destinos             | 1       | ACTIVE
conductores          | conductores          | 1       | ACTIVE
servicios-paciente   | servicios-paciente   | 1       | ACTIVE
reportes             | reportes             | 1       | ACTIVE
```

---

## Post-Deployment Testing

### Setup Environment Variables

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key-here"
export JWT_TOKEN="your-jwt-token-here"  # For authenticated requests
```

### Test 1: Dashboard Endpoint

```bash
curl -X GET "$SUPABASE_URL/functions/v1/reportes/dashboard" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "reporte": "dashboard_general",
    "datos": {
      "pacientes_activos": 0,
      "pacientes_totales": 0,
      "servicios_activos": 0,
      "servicios_totales": 0,
      "conductores_activos": 10,
      "conductores_totales": 10,
      "obras_sociales_activas": 15,
      "facturas_emitidas": 0,
      "facturas_pagadas": 0,
      "facturas_pendientes_monto": null,
      "cobranzas_pendientes": 0,
      "cobranzas_pendientes_monto": null,
      "cobranzas_vencidas": 0,
      "cobranzas_vencidas_monto": null,
      "traslados_mes_actual": null,
      "gastos_mes_actual": null,
      "fecha_actualizacion": "2026-01-31T..."
    },
    "fecha_actualizacion": "2026-01-31T..."
  }
}
```

### Test 2: Annual Billing Report

```bash
curl -X GET "$SUPABASE_URL/functions/v1/reportes/facturacion-anual?anio=2026" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "reporte": "facturacion_anual",
    "filtros": {
      "anio": "2026",
      "obra_social_id": null
    },
    "total_registros": 0,
    "datos": []
  }
}
```

### Test 3: Pending Collections Report

```bash
curl -X GET "$SUPABASE_URL/functions/v1/reportes/cobranzas-pendientes" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "reporte": "cobranzas_pendientes",
    "filtros": {
      "obra_social_id": null,
      "categoria_vencimiento": null
    },
    "resumen": {
      "total_registros": 0,
      "monto_total_pendiente": 0
    },
    "datos": []
  }
}
```

### Test 4: Patients by Health Insurance Report

```bash
curl -X GET "$SUPABASE_URL/functions/v1/reportes/pacientes-obra-social" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "reporte": "pacientes_obra_social",
    "filtros": {
      "obra_social_id": null
    },
    "resumen": {
      "total_obras_sociales": 15,
      "total_pacientes": 0,
      "total_servicios": 0
    },
    "datos": [
      {
        "obra_social_id": "uuid",
        "obra_social": "OSDE",
        "obra_social_codigo": "OS001",
        "total_pacientes": 0,
        "pacientes_activos": 0,
        "pacientes_inactivos": 0,
        "total_servicios": 0,
        "servicios_activos": 0,
        "servicios_ambulancia": 0,
        "servicios_traslado": 0,
        "servicios_emergencia": 0,
        "total_traslados_realizados": 0,
        "monto_total_obra_social": 0,
        "monto_total_paciente": 0
      }
    ]
  }
}
```

### Test 5: Monthly Profitability Report

```bash
curl -X GET "$SUPABASE_URL/functions/v1/reportes/rentabilidad-mensual?periodo=2026-01" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "reporte": "rentabilidad_mensual",
    "filtros": {
      "anio": null,
      "mes": null,
      "periodo": "2026-01"
    },
    "resumen": {
      "total_periodos": 0,
      "facturacion_total": 0,
      "egresos_totales": 0,
      "utilidad_neta_total": 0,
      "margen_promedio": 0
    },
    "datos": []
  }
}
```

### Test 6: Annual Summary Report

```bash
curl -X GET "$SUPABASE_URL/functions/v1/reportes/resumen-anual?anio=2026" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "reporte": "resumen_anual",
    "filtros": {
      "anio": "2026"
    },
    "total_anios": 0,
    "datos": []
  }
}
```

---

## Error Testing

### Test 1: Invalid Report Type

```bash
curl -X GET "$SUPABASE_URL/functions/v1/reportes/invalid-report" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid report type. Available: facturacion-anual, cobranzas-pendientes, pacientes-obra-social, rentabilidad-mensual, resumen-anual, dashboard",
    "status": 400
  }
}
```

### Test 2: Missing Authentication

```bash
curl -X GET "$SUPABASE_URL/functions/v1/reportes/dashboard" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "status": 401
  }
}
```

### Test 3: Invalid Method

```bash
curl -X POST "$SUPABASE_URL/functions/v1/reportes/dashboard" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "message": "Method not allowed",
    "status": 405
  }
}
```

---

## Database View Verification

### Test Views Directly in PostgreSQL

```sql
-- Test 1: Check vista_facturacion_anual structure
SELECT * FROM vista_facturacion_anual LIMIT 1;

-- Test 2: Check vista_cobranzas_pendientes structure
SELECT * FROM vista_cobranzas_pendientes LIMIT 1;

-- Test 3: Check vista_pacientes_obra_social structure
SELECT * FROM vista_pacientes_obra_social LIMIT 1;

-- Test 4: Check vista_rentabilidad_mensual structure
SELECT * FROM vista_rentabilidad_mensual LIMIT 1;

-- Test 5: Check vista_resumen_anual structure
SELECT * FROM vista_resumen_anual LIMIT 1;

-- Test 6: Check vista_dashboard_general structure
SELECT * FROM vista_dashboard_general LIMIT 1;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'vista_%';

-- Verify permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name LIKE 'vista_%' 
AND grantee = 'authenticated';
```

---

## Performance Testing

### Test View Performance

```sql
-- Test 1: Annual billing performance
EXPLAIN ANALYZE SELECT * FROM vista_facturacion_anual WHERE anio = 2026;

-- Test 2: Pending collections performance
EXPLAIN ANALYZE SELECT * FROM vista_cobranzas_pendientes 
WHERE categoria_vencimiento = 'Vigente';

-- Test 3: Patients by health insurance performance
EXPLAIN ANALYZE SELECT * FROM vista_pacientes_obra_social 
ORDER BY total_pacientes DESC;

-- Test 4: Monthly profitability performance
EXPLAIN ANALYZE SELECT * FROM vista_rentabilidad_mensual 
WHERE periodo = '2026-01';

-- Test 5: Annual summary performance
EXPLAIN ANALYZE SELECT * FROM vista_resumen_anual WHERE anio = 2026;

-- Test 6: Dashboard performance
EXPLAIN ANALYZE SELECT * FROM vista_dashboard_general;
```

---

## Integration Testing with Sample Data

### Create Sample Test Data

```sql
-- Insert test billing period
INSERT INTO periodos_facturacion (periodo, fecha_inicio, fecha_fin, estado)
VALUES ('2026-01', '2026-01-01', '2026-01-31', 'cerrado');

-- Get the period ID
SELECT id, periodo FROM periodos_facturacion WHERE periodo = '2026-01';

-- Insert test invoice
INSERT INTO facturas (
  numero_factura, fecha_emision, fecha_vencimiento, 
  periodo_id, obra_social_id, subtotal, impuestos, monto_total, estado
)
SELECT 
  'FAC-TEST-001', 
  '2026-01-15', 
  '2026-02-15',
  pf.id,
  os.id,
  10000.00,
  2100.00,
  12100.00,
  'emitida'
FROM periodos_facturacion pf, obras_sociales os
WHERE pf.periodo = '2026-01' AND os.codigo = 'OS001'
LIMIT 1;

-- Insert test collection
INSERT INTO cobranzas (
  numero_cobranza, fecha_cobranza, fecha_vencimiento,
  obra_social_id, periodo_id, 
  monto_total, monto_cobrado, monto_pendiente, estado
)
SELECT 
  'COB-TEST-001',
  '2026-01-20',
  '2026-02-20',
  os.id,
  pf.id,
  12100.00,
  5000.00,
  7100.00,
  'parcial'
FROM periodos_facturacion pf, obras_sociales os
WHERE pf.periodo = '2026-01' AND os.codigo = 'OS001'
LIMIT 1;
```

### Test Reports with Sample Data

```bash
# Test annual billing with sample data
curl -X GET "$SUPABASE_URL/functions/v1/reportes/facturacion-anual?anio=2026" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.data.datos[0]'

# Test pending collections with sample data
curl -X GET "$SUPABASE_URL/functions/v1/reportes/cobranzas-pendientes" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.data.resumen'

# Test dashboard with sample data
curl -X GET "$SUPABASE_URL/functions/v1/reportes/dashboard" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.data.datos'
```

### Cleanup Test Data

```sql
-- Delete test data
DELETE FROM cobranzas WHERE numero_cobranza LIKE 'COB-TEST-%';
DELETE FROM facturas WHERE numero_factura LIKE 'FAC-TEST-%';
DELETE FROM periodos_facturacion WHERE periodo = '2026-01';
```

---

## Validation Checklist

### Pre-Deployment
- [ ] All migration files exist
- [ ] Edge Function code is syntactically correct
- [ ] Documentation is complete
- [ ] Git commit includes all necessary files

### Deployment
- [ ] Database migration applied successfully
- [ ] All 6 views created
- [ ] RLS enabled on all views
- [ ] Permissions granted correctly
- [ ] Edge Function deployed
- [ ] Function shows as ACTIVE

### Post-Deployment
- [ ] Dashboard endpoint responds correctly
- [ ] Annual billing endpoint responds correctly
- [ ] Pending collections endpoint responds correctly
- [ ] Patients by health insurance endpoint responds correctly
- [ ] Monthly profitability endpoint responds correctly
- [ ] Annual summary endpoint responds correctly
- [ ] Error handling works correctly
- [ ] Authentication is enforced
- [ ] CORS headers present

### Performance
- [ ] All views execute in reasonable time
- [ ] Query plans are efficient
- [ ] No N+1 query issues
- [ ] Indexes are being used

---

## Troubleshooting

### Issue: Views not found
**Solution:** Verify migration was applied:
```sql
SELECT * FROM information_schema.views WHERE table_name LIKE 'vista_%';
```

### Issue: Permission denied
**Solution:** Check RLS policies and permissions:
```sql
SELECT * FROM pg_policies WHERE tablename LIKE 'vista_%';
```

### Issue: Edge Function returns 500
**Solution:** Check function logs:
```bash
supabase functions logs reportes --tail
```

### Issue: No data in reports
**Solution:** Verify underlying tables have data:
```sql
SELECT COUNT(*) FROM facturas;
SELECT COUNT(*) FROM cobranzas;
SELECT COUNT(*) FROM pacientes;
```

---

## Success Criteria

Phase 7 is considered successfully deployed when:

1. ✅ All 6 database views are created and accessible
2. ✅ Edge Function `reportes` is deployed and active
3. ✅ All 6 report endpoints return valid responses
4. ✅ Authentication is properly enforced
5. ✅ Error handling works correctly
6. ✅ Documentation is complete and accurate
7. ✅ Performance is acceptable (< 1 second for most queries)
8. ✅ RLS policies are working correctly

---

## Next Steps After Verification

Once Phase 7 is verified:

1. **Update API documentation** with actual endpoints
2. **Create frontend integration guide** for consuming reports
3. **Set up monitoring** for report endpoint usage
4. **Implement caching** if needed for performance
5. **Proceed to Phase 8** (Integration and End-to-End Testing)

---

**Document Version:** 1.0.0
**Last Updated:** 2026-01-31
**Status:** Ready for verification
