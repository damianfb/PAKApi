# FASE 7 - Complete Documentation

## Overview

Phase 7 (Fase 7) implementation for PAKApi includes:
- **Phase 7A**: Basic CRUD Edge Functions for core entities (COMPLETE ✅)
- **Phase 7B**: Reporting and Dashboard Edge Functions (NEW ✅)

This document covers the complete Phase 7 implementation, including all reports and dashboards.

---

## Phase 7A: CRUD Edge Functions ✅

### Implemented Entities (5 total)

1. **obras-sociales** - Health insurance companies CRUD
2. **pacientes** - Patients CRUD + services endpoint
3. **destinos** - Destinations CRUD
4. **conductores** - Drivers CRUD
5. **servicios-paciente** - Patient services CRUD

For detailed CRUD API documentation, see [FASE7A_API_DOCUMENTATION.md](FASE7A_API_DOCUMENTATION.md)

---

## Phase 7B: Reports and Dashboards ✅

### Database Views Created (6 total)

All views are implemented in migration `00008_create_fase7_reporting_views.sql`

#### 1. vista_facturacion_anual (Annual Billing View)
Aggregates invoices by year and health insurance company.

**Columns:**
- `anio` - Year
- `obra_social_id` - Health insurance ID
- `obra_social` - Health insurance name
- `total_facturas` - Total number of invoices
- `subtotal_total` - Total subtotal amount
- `impuestos_total` - Total tax amount
- `monto_total` - Total amount
- `monto_pagado` - Total paid amount
- `monto_pendiente` - Total pending amount
- `facturas_pagadas` - Number of paid invoices
- `facturas_pendientes` - Number of pending invoices
- `facturas_anuladas` - Number of canceled invoices

#### 2. vista_cobranzas_pendientes (Pending Collections View)
Lists all pending and partial collections with aging analysis.

**Columns:**
- `id`, `numero_cobranza` - Collection ID and number
- `fecha_cobranza`, `fecha_vencimiento` - Collection and due dates
- `obra_social_id`, `obra_social` - Health insurance details
- `obra_social_telefono`, `obra_social_email` - Contact information
- `periodo` - Billing period
- `monto_total`, `monto_cobrado`, `monto_pendiente` - Amounts
- `estado` - Status
- `dias_vencido` - Days overdue (0 if not due)
- `categoria_vencimiento` - Aging category: 'Sin vencimiento', 'Vigente', '1-30 días', '31-60 días', '61-90 días', 'Más de 90 días'
- `observaciones` - Notes

#### 3. vista_pacientes_obra_social (Patients by Health Insurance View)
Aggregates patients and services by health insurance company.

**Columns:**
- `obra_social_id`, `obra_social`, `obra_social_codigo` - Health insurance details
- `total_pacientes` - Total patients
- `pacientes_activos`, `pacientes_inactivos` - Active/inactive patients
- `total_servicios`, `servicios_activos` - Services count
- `servicios_ambulancia`, `servicios_traslado`, `servicios_emergencia` - Service types
- `total_traslados_realizados` - Total transports performed
- `monto_total_obra_social`, `monto_total_paciente` - Billing amounts

#### 4. vista_rentabilidad_mensual (Monthly Profitability View)
Calculates monthly profitability comparing income vs expenses.

**Columns:**
- `periodo_id`, `periodo` - Period identifier and code (YYYY-MM)
- `anio`, `mes` - Year and month
- `facturacion_total`, `facturacion_cobrada` - Total and collected billing
- `total_facturas`, `traslados_realizados` - Invoice and transport counts
- `gastos_operativos`, `total_gastos` - Operating expenses
- `liquidaciones_conductores`, `total_liquidaciones` - Driver settlements
- `egresos_totales` - Total expenses (operating + settlements)
- `utilidad_bruta` - Gross profit (billing - expenses)
- `utilidad_neta` - Net profit (collected - expenses)
- `margen_bruto_porcentaje` - Gross margin percentage
- `ingreso_promedio_traslado` - Average revenue per transport
- `costo_promedio_traslado` - Average cost per transport

#### 5. vista_resumen_anual (Annual Summary View)
Comprehensive annual summary with key business metrics.

**Columns:**
- `anio` - Year
- **Billing metrics:** `total_facturas`, `facturacion_total`, `facturacion_cobrada`, `obras_sociales_facturadas`
- **Collections metrics:** `total_cobranzas`, `cobranzas_total`, `cobranzas_cobrado`, `cobranzas_pendiente`
- **Transport metrics:** `total_traslados`, `pacientes_atendidos`, `obras_sociales_atendidas`
- **Expense metrics:** `total_gastos`, `gastos_operativos_total`, `gastos_combustible`, `gastos_mantenimiento`
- **Settlement metrics:** `total_liquidaciones`, `liquidaciones_total`, `conductores_liquidados`
- **Derived KPIs:** `utilidad_neta`, `margen_neto_porcentaje`, `ingreso_promedio_traslado`, `porcentaje_cobranza`

#### 6. vista_dashboard_general (General Dashboard View)
Current state metrics for the main dashboard.

**Columns:**
- `pacientes_activos`, `pacientes_totales` - Patient counts
- `servicios_activos`, `servicios_totales` - Service counts
- `conductores_activos`, `conductores_totales` - Driver counts
- `obras_sociales_activas` - Active health insurance count
- `facturas_emitidas`, `facturas_pagadas` - Invoice counts
- `facturas_pendientes_monto` - Pending invoices amount
- `cobranzas_pendientes`, `cobranzas_pendientes_monto` - Pending collections
- `cobranzas_vencidas`, `cobranzas_vencidas_monto` - Overdue collections
- `traslados_mes_actual` - Current month transports
- `gastos_mes_actual` - Current month expenses
- `fecha_actualizacion` - Last update timestamp

---

## Edge Function: reportes

**Location:** `supabase/functions/reportes/index.ts`

### Available Report Endpoints

#### 1. GET /reportes/facturacion-anual
Annual billing report with aggregation by year and health insurance.

**Query Parameters:**
- `anio` (optional) - Filter by year (e.g., 2026)
- `obra_social_id` (optional) - Filter by health insurance ID

**Response:**
```json
{
  "success": true,
  "data": {
    "reporte": "facturacion_anual",
    "filtros": {
      "anio": "2026",
      "obra_social_id": null
    },
    "total_registros": 5,
    "datos": [
      {
        "anio": 2026,
        "obra_social_id": "uuid",
        "obra_social": "OSDE",
        "total_facturas": 12,
        "subtotal_total": 500000.00,
        "impuestos_total": 105000.00,
        "monto_total": 605000.00,
        "monto_pagado": 500000.00,
        "monto_pendiente": 105000.00,
        "facturas_pagadas": 10,
        "facturas_pendientes": 2,
        "facturas_anuladas": 0
      }
    ]
  }
}
```

**Example:**
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/reportes/facturacion-anual?anio=2026" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 2. GET /reportes/cobranzas-pendientes
Pending collections report with aging analysis.

**Query Parameters:**
- `obra_social_id` (optional) - Filter by health insurance ID
- `categoria_vencimiento` (optional) - Filter by aging category

**Response:**
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
      "total_registros": 8,
      "monto_total_pendiente": 234500.00
    },
    "datos": [
      {
        "id": "uuid",
        "numero_cobranza": "COB-2026-001",
        "fecha_cobranza": "2026-01-15",
        "fecha_vencimiento": "2026-02-15",
        "obra_social_id": "uuid",
        "obra_social": "OSDE",
        "obra_social_telefono": "+54 11 1234-5678",
        "obra_social_email": "cobranzas@osde.com.ar",
        "periodo": "2026-01",
        "monto_total": 50000.00,
        "monto_cobrado": 20000.00,
        "monto_pendiente": 30000.00,
        "estado": "parcial",
        "dias_vencido": 0,
        "categoria_vencimiento": "Vigente",
        "observaciones": "Pending partial payment"
      }
    ]
  }
}
```

**Example:**
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/reportes/cobranzas-pendientes?categoria_vencimiento=Vigente" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. GET /reportes/pacientes-obra-social
Patients and services aggregated by health insurance company.

**Query Parameters:**
- `obra_social_id` (optional) - Filter by health insurance ID

**Response:**
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
      "total_pacientes": 250,
      "total_servicios": 180
    },
    "datos": [
      {
        "obra_social_id": "uuid",
        "obra_social": "OSDE",
        "obra_social_codigo": "OS001",
        "total_pacientes": 45,
        "pacientes_activos": 42,
        "pacientes_inactivos": 3,
        "total_servicios": 38,
        "servicios_activos": 35,
        "servicios_ambulancia": 20,
        "servicios_traslado": 15,
        "servicios_emergencia": 3,
        "total_traslados_realizados": 450,
        "monto_total_obra_social": 180000.00,
        "monto_total_paciente": 45000.00
      }
    ]
  }
}
```

**Example:**
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/reportes/pacientes-obra-social" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. GET /reportes/rentabilidad-mensual
Monthly profitability analysis with income vs expenses.

**Query Parameters:**
- `anio` (optional) - Filter by year
- `mes` (optional) - Filter by month (1-12)
- `periodo` (optional) - Filter by period code (YYYY-MM)

**Response:**
```json
{
  "success": true,
  "data": {
    "reporte": "rentabilidad_mensual",
    "filtros": {
      "anio": "2026",
      "mes": null,
      "periodo": null
    },
    "resumen": {
      "total_periodos": 12,
      "facturacion_total": 1200000.00,
      "egresos_totales": 850000.00,
      "utilidad_neta_total": 350000.00,
      "margen_promedio": "29.17"
    },
    "datos": [
      {
        "periodo_id": "uuid",
        "periodo": "2026-01",
        "anio": 2026,
        "mes": 1,
        "facturacion_total": 100000.00,
        "facturacion_cobrada": 85000.00,
        "total_facturas": 15,
        "traslados_realizados": 250,
        "gastos_operativos": 35000.00,
        "total_gastos": 45,
        "liquidaciones_conductores": 25000.00,
        "total_liquidaciones": 10,
        "egresos_totales": 60000.00,
        "utilidad_bruta": 40000.00,
        "utilidad_neta": 25000.00,
        "margen_bruto_porcentaje": 40.00,
        "ingreso_promedio_traslado": 400.00,
        "costo_promedio_traslado": 240.00
      }
    ]
  }
}
```

**Example:**
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/reportes/rentabilidad-mensual?periodo=2026-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5. GET /reportes/resumen-anual
Comprehensive annual summary with key business metrics.

**Query Parameters:**
- `anio` (optional) - Filter by year

**Response:**
```json
{
  "success": true,
  "data": {
    "reporte": "resumen_anual",
    "filtros": {
      "anio": "2026"
    },
    "total_anios": 1,
    "datos": [
      {
        "anio": 2026,
        "total_facturas": 180,
        "facturacion_total": 1200000.00,
        "facturacion_cobrada": 1020000.00,
        "obras_sociales_facturadas": 15,
        "total_cobranzas": 150,
        "cobranzas_total": 1200000.00,
        "cobranzas_cobrado": 1020000.00,
        "cobranzas_pendiente": 180000.00,
        "total_traslados": 3000,
        "pacientes_atendidos": 250,
        "obras_sociales_atendidas": 15,
        "total_gastos": 540,
        "gastos_operativos_total": 420000.00,
        "gastos_combustible": 180000.00,
        "gastos_mantenimiento": 120000.00,
        "total_liquidaciones": 120,
        "liquidaciones_total": 300000.00,
        "conductores_liquidados": 25,
        "utilidad_neta": 480000.00,
        "margen_neto_porcentaje": 40.00,
        "ingreso_promedio_traslado": 400.00,
        "porcentaje_cobranza": 85.00
      }
    ]
  }
}
```

**Example:**
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/reportes/resumen-anual?anio=2026" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 6. GET /reportes/dashboard
General dashboard with current state metrics.

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "reporte": "dashboard_general",
    "datos": {
      "pacientes_activos": 245,
      "pacientes_totales": 250,
      "servicios_activos": 220,
      "servicios_totales": 235,
      "conductores_activos": 28,
      "conductores_totales": 30,
      "obras_sociales_activas": 15,
      "facturas_emitidas": 12,
      "facturas_pagadas": 150,
      "facturas_pendientes_monto": 125000.00,
      "cobranzas_pendientes": 8,
      "cobranzas_pendientes_monto": 234500.00,
      "cobranzas_vencidas": 3,
      "cobranzas_vencidas_monto": 78000.00,
      "traslados_mes_actual": 250,
      "gastos_mes_actual": 35000.00,
      "fecha_actualizacion": "2026-01-31T02:36:52.244Z"
    },
    "fecha_actualizacion": "2026-01-31T02:36:52.244Z"
  }
}
```

**Example:**
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/reportes/dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Authentication

All report endpoints require authentication using a valid Supabase JWT token.

### Headers Required:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Row Level Security (RLS)
All database views have RLS enabled with `security_invoker = true`, which means:
- Views respect the same RLS policies as the underlying tables
- Only authenticated users can access the views
- Data is automatically filtered based on user permissions

---

## Deployment Instructions

### 1. Apply Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or apply the specific migration file
psql $DATABASE_URL < supabase/migrations/00008_create_fase7_reporting_views.sql
```

### 2. Deploy Edge Function

```bash
# Deploy the reportes function
supabase functions deploy reportes
```

### 3. Verify Deployment

```bash
# List deployed functions
supabase functions list

# Test the dashboard endpoint
curl -X GET "https://your-project.supabase.co/functions/v1/reportes/dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Testing Reports

### Test Script
A comprehensive test script is available at `test_edge_functions.sh`. To test reporting endpoints:

```bash
# Set your environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"

# Run tests
./test_edge_functions.sh
```

### Manual Testing
Test each report endpoint individually:

```bash
# 1. Test dashboard
curl -X GET "$SUPABASE_URL/functions/v1/reportes/dashboard" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"

# 2. Test annual billing
curl -X GET "$SUPABASE_URL/functions/v1/reportes/facturacion-anual?anio=2026" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"

# 3. Test pending collections
curl -X GET "$SUPABASE_URL/functions/v1/reportes/cobranzas-pendientes" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"

# 4. Test patients by health insurance
curl -X GET "$SUPABASE_URL/functions/v1/reportes/pacientes-obra-social" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"

# 5. Test monthly profitability
curl -X GET "$SUPABASE_URL/functions/v1/reportes/rentabilidad-mensual?anio=2026" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"

# 6. Test annual summary
curl -X GET "$SUPABASE_URL/functions/v1/reportes/resumen-anual" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

---

## Phase 7 Complete Checklist ✅

### Phase 7A: CRUD Operations
- [x] obras-sociales CRUD endpoints
- [x] pacientes CRUD endpoints + services
- [x] destinos CRUD endpoints
- [x] conductores CRUD endpoints
- [x] servicios-paciente CRUD endpoints
- [x] Shared utilities (CORS, response, Supabase client)
- [x] Complete API documentation

### Phase 7B: Reports and Dashboards
- [x] Database migration with 6 reporting views
- [x] vista_facturacion_anual (Annual Billing)
- [x] vista_cobranzas_pendientes (Pending Collections)
- [x] vista_pacientes_obra_social (Patients by Health Insurance)
- [x] vista_rentabilidad_mensual (Monthly Profitability)
- [x] vista_resumen_anual (Annual Summary)
- [x] vista_dashboard_general (General Dashboard)
- [x] Edge Function: reportes with 6 endpoints
- [x] Complete documentation

---

## Summary Statistics

### Database Objects
- **Views Created:** 6
- **Edge Functions:** 6 (5 CRUD + 1 reporting)
- **Report Endpoints:** 6
- **Total Endpoints:** 32 (26 CRUD + 6 reporting)

### Files Created/Modified
- **Migration Files:** 1 new (00008_create_fase7_reporting_views.sql)
- **Edge Function Files:** 1 new (reportes/index.ts)
- **Documentation Files:** 1 new (FASE7_COMPLETE_DOCUMENTATION.md)

---

## Next Steps

Phase 7 is now **COMPLETE ✅**. The system includes:
1. ✅ Full CRUD operations for all core entities
2. ✅ Comprehensive reporting and analytics
3. ✅ Dashboard metrics for management
4. ✅ Complete documentation
5. ✅ Production-ready deployment

Ready to proceed to **Phase 8** (Integration and End-to-End Testing) or any additional features as needed.

---

## Support and Maintenance

### Monitoring
- Monitor Edge Function logs in Supabase Dashboard
- Check database view performance with `EXPLAIN ANALYZE`
- Review error logs for failed report requests

### Performance Optimization
- Views are indexed through underlying tables
- Consider materialized views for very large datasets
- Implement caching for frequently accessed reports

### Security
- All views respect RLS policies
- JWT token authentication required
- No anonymous access to sensitive data

---

**Phase 7 Status:** ✅ **COMPLETE**
**Last Updated:** 2026-01-31
**Version:** 1.0.0
