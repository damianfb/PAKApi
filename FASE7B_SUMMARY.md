# FASE 7B - Batch and Automatic Processes

This document describes the Edge Functions for automated and batch processes in the PAKApi system.

## Overview

Phase 7B adds five Edge Functions that handle automatic and batch operations:

1. **traslados-generar-periodo** - Generate monthly transfers
2. **facturas-generar** - Generate monthly invoices
3. **liquidaciones-generar** - Generate driver settlements
4. **presupuesto-resumen** - Monthly budget summary
5. **reportes** - Multiple analytical reports

## Endpoints

### 1. POST /traslados/generar-periodo

Generates `traslados_mensuales` records for a billing period based on `servicios_paciente` and actual `horarios_traslados`.

**Request Body:**
```json
{
  "mes": 1,
  "anio": 2026
}
```

**Business Logic:**
- Finds or creates `periodo_facturacion` for the month/year
- For each active `servicio_paciente`:
  - Counts actual completed transports from `horarios_traslados`
  - Calculates authorized vs exceeded counts
  - Calculates billing amounts (obra_social + patient portions)
  - Creates or updates `traslados_mensuales` record

**Response:**
```json
{
  "periodo": { ... },
  "resultados": {
    "total": 45,
    "creados": 30,
    "actualizados": 15
  },
  "detalles": [ ... ]
}
```

---

### 2. POST /facturas/generar

Automatically generates invoices for a billing period from `traslados_mensuales`.

**Request Body:**
```json
{
  "mes": 1,
  "anio": 2026
}
```

**Business Logic:**
- Finds `periodo_facturacion` (must exist from previous step)
- Groups `traslados_mensuales` by `obra_social_id`
- For each obra social:
  - Creates one `factura` with:
    - Sequential invoice number (FAC-YYYY-####)
    - Subtotal from all transports
    - Taxes (21% IVA)
    - Total amount
  - Creates `facturas_detalle` for each patient's transports

**Response:**
```json
{
  "periodo": { ... },
  "resultados": {
    "total": 8,
    "facturas": [
      {
        "factura": { ... },
        "obra_social": { ... },
        "cantidad_pacientes": 15,
        "cantidad_traslados": 180
      }
    ]
  }
}
```

---

### 3. POST /liquidaciones/generar

Generates driver settlements/liquidations for a billing period.

**Request Body:**
```json
{
  "mes": 1,
  "anio": 2026
}
```

**Business Logic:**
- Finds `periodo_facturacion`
- For each active conductor:
  - Counts completed transports from `horarios_traslados`
  - Calculates transport amounts (base rate × count)
  - Sums operational expenses (`gastos_operativos`)
  - Calculates bonuses (e.g., 10% for >100 transports)
  - Calculates net amount: transports - expenses + bonuses - deductions
  - Creates `liquidaciones_conductores` record

**Response:**
```json
{
  "periodo": { ... },
  "resultados": {
    "total": 10,
    "liquidaciones": [
      {
        "liquidacion": { ... },
        "conductor": { ... }
      }
    ]
  }
}
```

---

### 4. GET /presupuesto/resumen/:mes/:anio

Returns monthly budget summary with income, expenses, and balance.

**Path Parameters:**
- `mes`: Month (1-12)
- `anio`: Year (e.g., 2026)

**Example:** `GET /presupuesto/resumen/1/2026`

**Business Logic:**
- Calculates income from `facturas` (emitida, pagada)
- Calculates expenses from:
  - `gastos_operativos` (aprobado, pagado)
  - `liquidaciones_conductores` (aprobada, pagada)
- Calculates balance and profitability metrics

**Response:**
```json
{
  "periodo": {
    "periodo": "2026-01",
    "mes": 1,
    "anio": 2026,
    "estado": "abierto"
  },
  "ingresos": {
    "total": 450000.00,
    "facturas": {
      "monto": 450000.00,
      "cantidad": 8,
      "emitidas": 5,
      "pagadas": 3
    }
  },
  "egresos": {
    "total": 280000.00,
    "gastos_operativos": {
      "monto": 80000.00,
      "cantidad": 45,
      "por_tipo": { ... }
    },
    "liquidaciones_conductores": {
      "monto": 200000.00,
      "cantidad": 10
    }
  },
  "balance": {
    "monto": 170000.00,
    "porcentaje_margen": 37.78
  },
  "estadisticas": {
    "total_traslados": 900,
    "total_pacientes": 45
  }
}
```

---

### 5. GET /reportes/*

Multiple analytical reports for business intelligence.

#### 5.1. GET /reportes/facturacion-anual/:anio

Annual billing report grouped by month.

**Example:** `GET /reportes/facturacion-anual/2026`

**Response:**
```json
{
  "anio": 2026,
  "resumen": {
    "total_anual": 5400000.00,
    "total_facturas": 96,
    "promedio_mensual": 450000.00,
    "meses_con_datos": 12
  },
  "por_mes": [
    {
      "periodo": "2026-01",
      "mes": 1,
      "cantidad_facturas": 8,
      "monto_total": 450000.00,
      "facturas_emitidas": 5,
      "facturas_pagadas": 3
    }
  ]
}
```

---

#### 5.2. GET /reportes/cobranzas-pendientes

Report of pending and overdue collections.

**Response:**
```json
{
  "resumen": {
    "total_cobranzas": 15,
    "total_pendiente": 380000.00,
    "total_vencidas": 5
  },
  "por_obra_social": [
    {
      "obra_social": { ... },
      "cantidad": 3,
      "monto_pendiente": 120000.00,
      "cobranzas": [ ... ]
    }
  ]
}
```

---

#### 5.3. GET /reportes/pacientes-por-obra-social

Distribution of patients by health insurance company.

**Response:**
```json
{
  "resumen": {
    "total_pacientes": 150,
    "total_obras_sociales": 12,
    "pacientes_sin_obra_social": 5
  },
  "por_obra_social": [
    {
      "obra_social": { ... },
      "cantidad_pacientes": 25,
      "pacientes": [ ... ]
    }
  ]
}
```

---

#### 5.4. GET /reportes/rentabilidad/:mes/:anio

Monthly profitability analysis.

**Example:** `GET /reportes/rentabilidad/1/2026`

**Response:**
```json
{
  "periodo": {
    "periodo": "2026-01",
    "mes": 1,
    "anio": 2026
  },
  "ingresos": {
    "total": 450000.00,
    "por_traslado": 500.00
  },
  "egresos": {
    "total": 280000.00,
    "gastos_operativos": 80000.00,
    "liquidaciones": 200000.00,
    "por_traslado": 311.11
  },
  "rentabilidad": {
    "utilidad": 170000.00,
    "margen_porcentaje": 37.78,
    "utilidad_por_traslado": 188.89
  },
  "estadisticas": {
    "total_traslados": 900,
    "total_facturas": 8,
    "total_gastos": 45,
    "total_liquidaciones": 10
  }
}
```

---

#### 5.5. GET /reportes/conductores-rendimiento/:mes/:anio

Driver performance analysis for a month.

**Example:** `GET /reportes/conductores-rendimiento/1/2026`

**Response:**
```json
{
  "periodo": {
    "periodo": "2026-01",
    "mes": 1,
    "anio": 2026
  },
  "resumen": {
    "total_conductores": 10,
    "total_traslados": 900,
    "total_completados": 870,
    "distancia_total": 8500.00
  },
  "por_conductor": [
    {
      "conductor": { ... },
      "traslados": {
        "total": 95,
        "completados": 92,
        "cancelados": 3,
        "tasa_completados": 96.84
      },
      "distancia": {
        "total_km": 850.00,
        "promedio_km": 9.24
      },
      "financiero": {
        "liquidacion": 27600.00,
        "gastos": 8500.00,
        "ingreso_por_traslado": 300.00
      }
    }
  ]
}
```

---

## Shared Utilities

### /supabase/functions/_shared/utils.ts

Common utility functions used across all batch/report functions:

- **formatDate()** - Format dates to YYYY-MM-DD
- **getPeriodo()** - Get periodo string (YYYY-MM) from month/year
- **parsePeriodo()** - Parse periodo string to month/year
- **getMonthRange()** - Get first and last day of a month
- **generateNumero()** - Generate sequential numbers (e.g., FAC-2026-0001)
- **validatePeriodo()** - Validate month (1-12) and year
- **calcularPorcentaje()** - Calculate percentage
- **redondear()** - Round to 2 decimal places

---

## Typical Workflow

### Month-End Closing Process

1. **Generate Transfers** (Day 1 of new month)
   ```bash
   POST /traslados/generar-periodo
   { "mes": 1, "anio": 2026 }
   ```

2. **Generate Invoices** (After transfers)
   ```bash
   POST /facturas/generar
   { "mes": 1, "anio": 2026 }
   ```

3. **Generate Driver Settlements** (After transfers)
   ```bash
   POST /liquidaciones/generar
   { "mes": 1, "anio": 2026 }
   ```

4. **Review Budget Summary**
   ```bash
   GET /presupuesto/resumen/1/2026
   ```

5. **Generate Reports** (As needed)
   ```bash
   GET /reportes/rentabilidad/1/2026
   GET /reportes/conductores-rendimiento/1/2026
   GET /reportes/cobranzas-pendientes
   ```

---

## Business Rules

### Pricing Logic

The functions use simplified pricing logic:
- **Transport rate**: $500 per transport (for invoicing)
- **Driver rate**: $300 per transport (for settlements)
- **IVA tax**: 21% on invoices
- **Bonus threshold**: 10% bonus for drivers with >100 transports/month

**Note:** In production, these rates should come from:
- Contract tables with obra_social rates
- Driver contracts or rate tables
- Configurable tax rates

### Status Workflows

**Transport States Counted:**
- `completado` - Completed
- `confirmado` - Confirmed

**Invoice States:**
- `borrador` - Draft (not counted in income)
- `emitida` - Issued (counted in income)
- `pagada` - Paid (counted in income)
- `anulada` - Cancelled (not counted)

**Expense States:**
- `registrado` - Registered (not counted)
- `aprobado` - Approved (counted in expenses)
- `pagado` - Paid (counted in expenses)
- `rechazado` - Rejected (not counted)

**Settlement States:**
- `pendiente` - Pending (not counted in expenses)
- `aprobada` - Approved (counted in expenses)
- `pagada` - Paid (counted in expenses)
- `anulada` - Cancelled (not counted)

---

## Error Handling

All endpoints include:
- Input validation (mes, anio, etc.)
- Missing data checks (periodo must exist for some operations)
- Database error handling with detailed error messages
- Transactional consistency (records created/updated atomically)

Common error responses:
- `400` - Invalid input parameters
- `404` - Required data not found (e.g., periodo)
- `405` - Method not allowed
- `500` - Internal server error

---

## Testing

### Example Test Sequence

```bash
# 1. Generate transfers for January 2026
curl -X POST "https://your-project.supabase.co/functions/v1/traslados-generar-periodo" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"mes": 1, "anio": 2026}'

# 2. Generate invoices
curl -X POST "https://your-project.supabase.co/functions/v1/facturas-generar" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"mes": 1, "anio": 2026}'

# 3. Generate settlements
curl -X POST "https://your-project.supabase.co/functions/v1/liquidaciones-generar" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"mes": 1, "anio": 2026}'

# 4. Check budget
curl "https://your-project.supabase.co/functions/v1/presupuesto-resumen/1/2026" \
  -H "Authorization: Bearer YOUR_JWT"

# 5. Get reports
curl "https://your-project.supabase.co/functions/v1/reportes/rentabilidad/1/2026" \
  -H "Authorization: Bearer YOUR_JWT"
```

---

## Deployment

Deploy all functions using Supabase CLI:

```bash
# Deploy individual functions
supabase functions deploy traslados-generar-periodo
supabase functions deploy facturas-generar
supabase functions deploy liquidaciones-generar
supabase functions deploy presupuesto-resumen
supabase functions deploy reportes

# Or deploy all at once
for func in traslados-generar-periodo facturas-generar liquidaciones-generar presupuesto-resumen reportes; do
  supabase functions deploy $func
done
```

---

## Implementation Notes

### What's Included

✅ Automatic transfer generation based on service configurations
✅ Automatic invoice generation with line items
✅ Driver settlement calculation with expenses and bonuses
✅ Monthly budget summary with income/expenses/balance
✅ Five analytical reports for business intelligence
✅ Shared utility functions for common operations
✅ Input validation and error handling
✅ CORS support for all endpoints

### What's Simplified

⚠️ **Pricing rates are hardcoded** - Should come from database tables
⚠️ **Tax rates are fixed at 21%** - Should be configurable
⚠️ **Bonus logic is basic** - Can be made more sophisticated
⚠️ **No complex authorization checks** - Uses basic RLS
⚠️ **No transaction rollback on partial failures** - Could be improved
⚠️ **Reports are not paginated** - May need pagination for large datasets

### Future Enhancements

- Add rate/contract tables for dynamic pricing
- Implement transaction management for multi-step operations
- Add report caching for performance
- Add PDF generation for invoices and reports
- Add email notifications for generated documents
- Add batch operation scheduling (cron jobs)
- Add audit logging for all batch operations

---

## FASE 7B Status: COMPLETE ✅

All required endpoints implemented:
- ✅ POST /traslados/generar-periodo
- ✅ POST /facturas/generar
- ✅ POST /liquidaciones/generar
- ✅ GET /presupuesto/resumen/:mes/:anio
- ✅ GET /reportes/* (5 report types)

Ready for testing and deployment!
