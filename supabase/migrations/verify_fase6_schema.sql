-- Verification queries for FASE 6 tables
-- Run these queries after applying 00007_create_fase6_tables.sql to verify the schema

-- ============================================
-- 1. Verify tables exist
-- ============================================
SELECT 
    'gastos_operativos' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'gastos_operativos'
    ) as exists;

SELECT 
    'liquidaciones_conductores' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'liquidaciones_conductores'
    ) as exists;

-- ============================================
-- 2. Verify RLS is enabled
-- ============================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN ('gastos_operativos', 'liquidaciones_conductores')
ORDER BY tablename;

-- ============================================
-- 3. Verify RLS policies
-- ============================================
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('gastos_operativos', 'liquidaciones_conductores')
ORDER BY tablename, policyname;

-- ============================================
-- 4. Verify triggers exist
-- ============================================
SELECT 
    event_object_table as table_name,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('gastos_operativos', 'liquidaciones_conductores')
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 5. Verify foreign keys
-- ============================================
SELECT
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
    ON rc.constraint_name = tc.constraint_name
    AND rc.constraint_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN ('gastos_operativos', 'liquidaciones_conductores')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 6. Verify unique constraints
-- ============================================
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
AND tc.table_schema = 'public'
AND tc.table_name IN ('gastos_operativos', 'liquidaciones_conductores')
ORDER BY tc.table_name, tc.constraint_type, kcu.column_name;

-- ============================================
-- 7. Verify indexes
-- ============================================
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('gastos_operativos', 'liquidaciones_conductores')
ORDER BY tablename, indexname;

-- ============================================
-- 8. Verify column definitions for gastos_operativos
-- ============================================
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'gastos_operativos'
ORDER BY ordinal_position;

-- ============================================
-- 9. Verify column definitions for liquidaciones_conductores
-- ============================================
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'liquidaciones_conductores'
ORDER BY ordinal_position;

-- ============================================
-- 10. Verify check constraints
-- ============================================
SELECT
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
    AND tc.constraint_schema = cc.constraint_schema
WHERE tc.constraint_type = 'CHECK'
AND tc.table_schema = 'public'
AND tc.table_name IN ('gastos_operativos', 'liquidaciones_conductores')
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================
-- 11. Count records in each table
-- ============================================
SELECT 'gastos_operativos' as table_name, COUNT(*) as record_count FROM gastos_operativos
UNION ALL
SELECT 'liquidaciones_conductores' as table_name, COUNT(*) as record_count FROM liquidaciones_conductores;

-- ============================================
-- Expected Results Summary
-- ============================================
-- Tables: 2 (gastos_operativos, liquidaciones_conductores)
-- RLS enabled: 2 tables
-- RLS policies: 2 (one per table, "Usuarios autenticados tienen acceso completo")
-- Triggers: 2 (one updated_at trigger per table)
-- Foreign keys: 4 total
--   - gastos_operativos: 2 FKs (conductor_id SET NULL, periodo_id SET NULL)
--   - liquidaciones_conductores: 2 FKs (conductor_id CASCADE, periodo_id SET NULL)
-- Unique constraints: 4 total (2 PKs + 2 unique number fields)
-- Indexes: 14 total
--   - gastos_operativos: 7 (PK + 6 regular indexes)
--   - liquidaciones_conductores: 7 (PK + 6 regular indexes)
-- Check constraints: Multiple per table
--   - gastos_operativos: monto >= 0, fecha_pago >= fecha
--   - liquidaciones_conductores: non-negative amounts, monto_neto calculation, fecha_pago >= fecha_generacion
-- Record counts: 0 for both tables initially
