-- Verification queries for FASE 5 schema (horarios_traslados table)
-- Run these queries to verify the migration was successful

-- ============================================
-- 1. Verify table existence
-- ============================================
SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE tablename = 'horarios_traslados';
-- Expected: 1 row with tablename='horarios_traslados', schemaname='public'

-- ============================================
-- 2. Verify RLS is enabled
-- ============================================
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'horarios_traslados';
-- Expected: rowsecurity = true

-- ============================================
-- 3. Verify RLS policies
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'horarios_traslados';
-- Expected: 1 policy named "Usuarios autenticados tienen acceso completo" for all commands

-- ============================================
-- 4. Verify triggers
-- ============================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'horarios_traslados';
-- Expected: 1 trigger named 'update_horarios_traslados_updated_at' for UPDATE events

-- ============================================
-- 5. Verify foreign keys
-- ============================================
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'horarios_traslados'
ORDER BY tc.constraint_name;
-- Expected: 5 foreign keys:
--   1. paciente_id → pacientes.id (CASCADE)
--   2. conductor_id → conductores.id (SET NULL)
--   3. destino_id → destinos.id (SET NULL)
--   4. servicio_paciente_id → servicios_paciente.id (SET NULL)
--   5. traslado_mensual_id → traslados_mensuales.id (SET NULL)

-- ============================================
-- 6. Verify unique constraints
-- ============================================
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_name = 'horarios_traslados'
ORDER BY tc.constraint_name, kcu.ordinal_position;
-- Expected: 2 unique constraints:
--   1. Primary key on id
--   2. Composite unique constraint on (paciente_id, fecha, tipo_traslado, servicio_paciente_id)

-- ============================================
-- 7. Verify indexes
-- ============================================
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'horarios_traslados'
ORDER BY indexname;
-- Expected: 9 indexes:
--   - horarios_traslados_pkey (primary key on id)
--   - idx_horarios_traslados_paciente_id
--   - idx_horarios_traslados_conductor_id
--   - idx_horarios_traslados_destino_id
--   - idx_horarios_traslados_servicio_paciente_id
--   - idx_horarios_traslados_traslado_mensual_id
--   - idx_horarios_traslados_fecha
--   - idx_horarios_traslados_estado
--   - unique_horario_traslado (composite unique index)

-- ============================================
-- 8. Verify column definitions
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns
WHERE table_name = 'horarios_traslados'
ORDER BY ordinal_position;
-- Expected columns:
--   - id: uuid, NOT NULL, default: gen_random_uuid()
--   - paciente_id: uuid, NOT NULL
--   - conductor_id: uuid, NULL
--   - destino_id: uuid, NULL
--   - servicio_paciente_id: uuid, NULL
--   - traslado_mensual_id: uuid, NULL
--   - fecha: date, NOT NULL
--   - hora_inicio: time, NULL
--   - hora_fin: time, NULL
--   - hora_salida_real: time, NULL
--   - hora_llegada_real: time, NULL
--   - tipo_traslado: character varying(100), NOT NULL
--   - estado: character varying(50), default: 'programado'
--   - distancia_km: numeric(8,2), NULL
--   - observaciones: text, NULL
--   - motivo_cancelacion: text, NULL
--   - created_at: timestamp with time zone, default: now()
--   - updated_at: timestamp with time zone, default: now()

-- ============================================
-- 9. Verify check constraints
-- ============================================
SELECT
    tc.constraint_name,
    tc.table_name,
    cc.check_clause
FROM information_schema.table_constraints AS tc
JOIN information_schema.check_constraints AS cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
    AND tc.table_name = 'horarios_traslados'
ORDER BY tc.constraint_name;
-- Expected: 3 check constraints:
--   1. check_distancia_non_negative: distancia_km IS NULL OR distancia_km >= 0
--   2. check_hora_inicio_fin: hora_fin IS NULL OR hora_inicio IS NULL OR hora_fin >= hora_inicio
--   3. check_hora_salida_llegada: hora_llegada_real IS NULL OR hora_salida_real IS NULL OR hora_llegada_real >= hora_salida_real

-- ============================================
-- 10. Count records (should be 0 initially)
-- ============================================
SELECT COUNT(*) as total_horarios_traslados
FROM horarios_traslados;
-- Expected: 0 (table should be empty after migration)

-- ============================================
-- Summary
-- ============================================
-- This verification script checks:
-- ✓ Table exists with proper name
-- ✓ RLS is enabled
-- ✓ RLS policy exists for authenticated users
-- ✓ updated_at trigger is configured
-- ✓ 5 foreign key relationships with appropriate CASCADE/SET NULL rules
-- ✓ 2 unique constraints (PK + composite)
-- ✓ 9 indexes for performance (PK, 7 regular indexes, 1 composite unique index)
-- ✓ 18 columns with correct data types and nullability
-- ✓ 3 check constraints for data validation
-- ✓ Initial record count is 0
