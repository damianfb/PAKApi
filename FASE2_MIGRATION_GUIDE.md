# FASE 2 - Quick Migration Guide

## Overview
This guide provides step-by-step instructions to apply the FASE 2 migration to your Supabase/PostgreSQL database.

## Prerequisites
- FASE 1 tables must be already created (obras_sociales, pacientes, conductores, destinos)
- Database connection established
- Appropriate permissions to create tables and policies

## Migration Files
- `00003_create_fase2_tables.sql` - Creates the three new tables

## Tables Created
1. **servicios_paciente** - Patient transport service configuration
2. **periodos_facturacion** - Monthly billing periods
3. **traslados_mensuales** - Monthly transport tracking

## Apply Migration

### Option 1: Supabase CLI (Recommended)
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

### Option 2: Supabase Dashboard
1. Open your Supabase project
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/00003_create_fase2_tables.sql`
5. Paste into the editor
6. Click **Run** (or press Ctrl+Enter)
7. Verify no errors appear

### Option 3: psql Command Line
```bash
# Replace with your connection string
psql YOUR_CONNECTION_STRING -f supabase/migrations/00003_create_fase2_tables.sql
```

### Option 4: pgAdmin or Database Client
1. Open your preferred PostgreSQL client
2. Connect to your database
3. Open and execute `supabase/migrations/00003_create_fase2_tables.sql`

## Verify Migration

Run the verification queries:
```bash
psql YOUR_CONNECTION_STRING -f supabase/migrations/verify_fase2_schema.sql
```

Or in Supabase Dashboard SQL Editor, copy and run `verify_fase2_schema.sql`.

### Expected Results
✅ 3 new tables created
✅ 3 tables with RLS enabled
✅ 3 RLS policies ("Usuarios autenticados tienen acceso completo")
✅ 3 updated_at triggers
✅ 7 foreign key relationships
✅ 1 partial unique index on servicios_paciente
✅ 2 unique constraints on other tables
✅ 12 performance indexes
✅ 7 CHECK constraints

## Manual Verification Queries

Check tables exist:
```sql
SELECT tablename FROM pg_tables 
WHERE tablename IN ('servicios_paciente', 'periodos_facturacion', 'traslados_mensuales');
```

Check RLS is enabled:
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('servicios_paciente', 'periodos_facturacion', 'traslados_mensuales');
```

Check policies exist:
```sql
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('servicios_paciente', 'periodos_facturacion', 'traslados_mensuales');
```

## Test Data (Optional)

After migration, you can test with sample data:

```sql
-- Create a billing period
INSERT INTO periodos_facturacion (periodo, fecha_inicio, fecha_fin)
VALUES ('2026-01', '2026-01-01', '2026-01-31');

-- Create a service configuration (requires existing paciente_id)
INSERT INTO servicios_paciente 
  (paciente_id, tipo_servicio, fecha_inicio)
VALUES 
  ('YOUR_PACIENTE_UUID', 'traslado_programado', '2026-01-01');

-- Create a monthly transport record
INSERT INTO traslados_mensuales 
  (paciente_id, periodo_id, cantidad_traslados, monto_total)
VALUES 
  ('YOUR_PACIENTE_UUID', 'YOUR_PERIODO_UUID', 10, 5000.00);
```

## Rollback (If Needed)

If you need to rollback the migration:

```sql
DROP TABLE IF EXISTS traslados_mensuales CASCADE;
DROP TABLE IF EXISTS servicios_paciente CASCADE;
DROP TABLE IF EXISTS periodos_facturacion CASCADE;
```

**Warning:** This will delete all data in these tables!

## Troubleshooting

### Error: role "authenticated" does not exist
This is normal in plain PostgreSQL. The "authenticated" role is specific to Supabase. If using plain PostgreSQL for testing, create it first:
```sql
CREATE ROLE authenticated;
```

### Error: relation does not exist
Make sure FASE 1 tables are created first. The new tables reference:
- pacientes
- obras_sociales
- destinos

### Error: duplicate key value
This means you're trying to insert duplicate data. Check:
- periodos_facturacion: periodo must be unique
- traslados_mensuales: (paciente_id, periodo_id) must be unique
- servicios_paciente: only one active service per (paciente_id, tipo_servicio, destino_id)

## Support

For detailed documentation, see:
- `FASE2_SUMMARY.md` - Complete implementation details
- `supabase/SCHEMA.md` - ER diagrams and relationships
- `README.md` - Project overview

## Next Steps

After successful migration:
1. ✅ Verify all tables created
2. ✅ Test RLS policies with your application
3. ✅ Begin using the new tables in your application
4. 🔜 Proceed to FASE 3 (if planned)
