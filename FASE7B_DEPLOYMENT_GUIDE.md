# FASE 7B - Deployment and Testing Guide

## Quick Reference

### New Edge Functions (Phase 7B)

| Function | Method | Path | Purpose |
|----------|--------|------|---------|
| traslados-generar-periodo | POST | /traslados/generar-periodo | Generate monthly transfers |
| facturas-generar | POST | /facturas/generar | Generate monthly invoices |
| liquidaciones-generar | POST | /liquidaciones/generar | Generate driver settlements |
| presupuesto-resumen | GET | /presupuesto/resumen/:mes/:anio | Monthly budget summary |
| reportes | GET | /reportes/* | Various analytical reports |

## Prerequisites

1. **Supabase CLI** installed:
   ```bash
   npm install -g supabase
   ```

2. **Supabase Project** linked:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Database Migrations** applied (Phases 1-6):
   - All tables must exist before using these functions
   - Run migrations 00001 through 00007 if not already applied

## Deployment

### Deploy All Phase 7B Functions

```bash
cd /path/to/PAKApi

# Deploy each function individually
supabase functions deploy traslados-generar-periodo
supabase functions deploy facturas-generar
supabase functions deploy liquidaciones-generar
supabase functions deploy presupuesto-resumen
supabase functions deploy reportes

# Or use a loop to deploy all
for func in traslados-generar-periodo facturas-generar liquidaciones-generar presupuesto-resumen reportes; do
  echo "Deploying $func..."
  supabase functions deploy $func
done
```

### Verify Deployment

```bash
# List all deployed functions
supabase functions list

# Check function logs
supabase functions logs traslados-generar-periodo
```

## Testing

### Setup Test Environment

1. **Get Authentication Token**

   Option A - Using Supabase Dashboard:
   - Go to your project's API settings
   - Copy the `anon` key for testing with RLS
   - Or copy the `service_role` key for admin testing (be careful!)

   Option B - Using Authentication:
   ```bash
   # Create a test user and get JWT token
   # Use Supabase Auth API or dashboard
   ```

2. **Set Environment Variables**
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_ANON_KEY="your-anon-key"
   export JWT_TOKEN="your-jwt-token"
   ```

### Test Cases

#### 1. Generate Monthly Transfers

**Prerequisites:**
- Active `servicios_paciente` records
- Active `horarios_traslados` records for the period

**Test:**
```bash
curl -X POST "${SUPABASE_URL}/functions/v1/traslados-generar-periodo" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 1,
    "anio": 2026
  }'
```

**Expected Response:**
```json
{
  "periodo": {
    "id": "uuid",
    "periodo": "2026-01",
    "estado": "abierto"
  },
  "resultados": {
    "total": 45,
    "creados": 30,
    "actualizados": 15
  },
  "detalles": [...]
}
```

**Validation:**
```sql
-- Check created traslados_mensuales
SELECT * FROM traslados_mensuales 
WHERE periodo_id = (SELECT id FROM periodos_facturacion WHERE periodo = '2026-01');
```

---

#### 2. Generate Monthly Invoices

**Prerequisites:**
- Run step 1 first (traslados must exist)
- `traslados_mensuales` with `monto_obra_social > 0`

**Test:**
```bash
curl -X POST "${SUPABASE_URL}/functions/v1/facturas-generar" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 1,
    "anio": 2026
  }'
```

**Expected Response:**
```json
{
  "periodo": {...},
  "resultados": {
    "total": 8,
    "facturas": [
      {
        "factura": {
          "numero_factura": "FAC-2026-0001",
          "monto_total": 54500.00
        },
        "obra_social": {...},
        "cantidad_pacientes": 15,
        "cantidad_traslados": 180
      }
    ]
  }
}
```

**Validation:**
```sql
-- Check created facturas
SELECT f.numero_factura, f.monto_total, f.estado, os.nombre
FROM facturas f
JOIN obras_sociales os ON f.obra_social_id = os.id
WHERE f.periodo_id = (SELECT id FROM periodos_facturacion WHERE periodo = '2026-01');

-- Check facturas_detalle
SELECT fd.descripcion, fd.cantidad, fd.subtotal
FROM facturas_detalle fd
JOIN facturas f ON fd.factura_id = f.id
WHERE f.periodo_id = (SELECT id FROM periodos_facturacion WHERE periodo = '2026-01');
```

---

#### 3. Generate Driver Settlements

**Prerequisites:**
- Run step 1 first (traslados must exist)
- Active `conductores` with completed transports

**Test:**
```bash
curl -X POST "${SUPABASE_URL}/functions/v1/liquidaciones-generar" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 1,
    "anio": 2026
  }'
```

**Expected Response:**
```json
{
  "periodo": {...},
  "resultados": {
    "total": 10,
    "liquidaciones": [
      {
        "liquidacion": {
          "numero_liquidacion": "LIQ-2026-0001",
          "monto_neto": 27600.00
        },
        "conductor": {...}
      }
    ]
  }
}
```

**Validation:**
```sql
-- Check created liquidaciones
SELECT l.numero_liquidacion, l.cantidad_traslados, l.monto_neto, 
       c.nombre, c.apellido
FROM liquidaciones_conductores l
JOIN conductores c ON l.conductor_id = c.id
WHERE l.periodo_id = (SELECT id FROM periodos_facturacion WHERE periodo = '2026-01');
```

---

#### 4. Get Budget Summary

**Prerequisites:**
- Run steps 1-3 first
- Facturas and liquidaciones must exist

**Test:**
```bash
curl -X GET "${SUPABASE_URL}/functions/v1/presupuesto-resumen/1/2026" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Expected Response:**
```json
{
  "periodo": {
    "periodo": "2026-01",
    "mes": 1,
    "anio": 2026
  },
  "ingresos": {
    "total": 450000.00,
    "facturas": {
      "monto": 450000.00,
      "cantidad": 8
    }
  },
  "egresos": {
    "total": 280000.00,
    "gastos_operativos": {
      "monto": 80000.00
    },
    "liquidaciones_conductores": {
      "monto": 200000.00
    }
  },
  "balance": {
    "monto": 170000.00,
    "porcentaje_margen": 37.78
  }
}
```

---

#### 5. Get Reports

##### 5.1 Annual Billing Report

```bash
curl -X GET "${SUPABASE_URL}/functions/v1/reportes/facturacion-anual/2026" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

##### 5.2 Pending Collections

```bash
curl -X GET "${SUPABASE_URL}/functions/v1/reportes/cobranzas-pendientes" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

##### 5.3 Patients by Health Insurance

```bash
curl -X GET "${SUPABASE_URL}/functions/v1/reportes/pacientes-por-obra-social" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

##### 5.4 Monthly Profitability

```bash
curl -X GET "${SUPABASE_URL}/functions/v1/reportes/rentabilidad/1/2026" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

##### 5.5 Driver Performance

```bash
curl -X GET "${SUPABASE_URL}/functions/v1/reportes/conductores-rendimiento/1/2026" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

---

## Complete End-to-End Test Script

Save this as `test_fase7b.sh`:

```bash
#!/bin/bash

# Configuration
SUPABASE_URL="https://your-project.supabase.co"
JWT_TOKEN="your-jwt-token"
MES=1
ANIO=2026

echo "🚀 Testing FASE 7B Edge Functions"
echo "=================================="
echo ""

# Test 1: Generate Transfers
echo "1️⃣ Generating monthly transfers..."
RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/traslados-generar-periodo" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"mes\": ${MES}, \"anio\": ${ANIO}}")

echo "Response: ${RESPONSE}"
echo ""

# Test 2: Generate Invoices
echo "2️⃣ Generating invoices..."
RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/facturas-generar" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"mes\": ${MES}, \"anio\": ${ANIO}}")

echo "Response: ${RESPONSE}"
echo ""

# Test 3: Generate Settlements
echo "3️⃣ Generating driver settlements..."
RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/liquidaciones-generar" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"mes\": ${MES}, \"anio\": ${ANIO}}")

echo "Response: ${RESPONSE}"
echo ""

# Test 4: Budget Summary
echo "4️⃣ Getting budget summary..."
RESPONSE=$(curl -s -X GET "${SUPABASE_URL}/functions/v1/presupuesto-resumen/${MES}/${ANIO}" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

echo "Response: ${RESPONSE}"
echo ""

# Test 5: Reports
echo "5️⃣ Getting profitability report..."
RESPONSE=$(curl -s -X GET "${SUPABASE_URL}/functions/v1/reportes/rentabilidad/${MES}/${ANIO}" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

echo "Response: ${RESPONSE}"
echo ""

echo "✅ All tests completed!"
```

Run it with:
```bash
chmod +x test_fase7b.sh
./test_fase7b.sh
```

---

## Troubleshooting

### Common Errors

#### 1. "Periodo de facturación no encontrado"

**Problem:** Trying to generate invoices/settlements without first generating transfers.

**Solution:** Always run `/traslados/generar-periodo` first.

#### 2. "No hay traslados para facturar"

**Problem:** No `traslados_mensuales` with `monto_obra_social > 0`.

**Solution:** 
- Check that `servicios_paciente` have `obra_social_id` set
- Check that there are completed `horarios_traslados` in the period
- Run `/traslados/generar-periodo` to ensure data is current

#### 3. "Error al obtener servicios de pacientes"

**Problem:** Database query error or permissions issue.

**Solution:**
- Check RLS policies on tables
- Ensure JWT token has proper permissions
- Check database logs: `supabase logs db`

#### 4. CORS Errors

**Problem:** Browser blocks request due to CORS.

**Solution:**
- Verify CORS headers are set in function
- Check that request includes proper `Authorization` header
- Use `curl` or Postman to bypass browser CORS for testing

### Debug Mode

Add logging to see what's happening:

```bash
# Watch function logs in real-time
supabase functions logs traslados-generar-periodo --tail

# Check last 100 log entries
supabase functions logs traslados-generar-periodo --limit 100
```

### Database Verification

After running batch operations, verify data:

```sql
-- Check periodo status
SELECT * FROM periodos_facturacion 
WHERE periodo = '2026-01';

-- Check traslados count
SELECT COUNT(*), SUM(cantidad_traslados) 
FROM traslados_mensuales
WHERE periodo_id = (SELECT id FROM periodos_facturacion WHERE periodo = '2026-01');

-- Check facturas generated
SELECT COUNT(*), SUM(monto_total)
FROM facturas
WHERE periodo_id = (SELECT id FROM periodos_facturacion WHERE periodo = '2026-01');

-- Check liquidaciones generated
SELECT COUNT(*), SUM(monto_neto)
FROM liquidaciones_conductores
WHERE periodo_id = (SELECT id FROM periodos_facturacion WHERE periodo = '2026-01');
```

---

## Performance Considerations

### Expected Execution Times

- **traslados-generar-periodo**: 2-10 seconds (depending on patient count)
- **facturas-generar**: 1-5 seconds (depending on obra social count)
- **liquidaciones-generar**: 1-5 seconds (depending on conductor count)
- **presupuesto-resumen**: <1 second
- **reportes**: <2 seconds

### Optimization Tips

1. **Index Check**: Ensure all foreign keys are indexed (already done in migrations)
2. **Batch Size**: For >1000 patients, consider adding pagination to batch operations
3. **Caching**: Consider caching report results for frequently accessed data
4. **Parallel Processing**: For very large datasets, split processing by obra_social or conductor

---

## Security Notes

### Authentication

All endpoints require authentication:
- Use JWT token from Supabase Auth
- Or use service_role key (admin only, never expose to clients)

### Row Level Security (RLS)

All tables have RLS enabled with policy:
```sql
CREATE POLICY "Usuarios autenticados tienen acceso completo"
ON table_name FOR ALL TO authenticated
USING (true) WITH CHECK (true);
```

For production:
- Consider more restrictive RLS policies
- Add role-based access control
- Implement audit logging

---

## Next Steps

After successful deployment and testing:

1. **Integration**: Integrate with frontend application
2. **Scheduling**: Set up cron jobs for automatic monthly processing
3. **Monitoring**: Configure alerts for failed operations
4. **Documentation**: Update API documentation with production URLs
5. **Optimization**: Profile and optimize based on production usage

---

## Support

For issues or questions:
1. Check function logs: `supabase functions logs <function-name>`
2. Review database state with SQL queries above
3. Verify all prerequisites are met
4. Check FASE7B_SUMMARY.md for detailed endpoint documentation
