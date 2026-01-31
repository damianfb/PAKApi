-- Verification queries for FASE 4 tables
-- Run this after applying 00005_create_fase4_tables.sql to verify the schema

-- ============================================
-- 1. Verify tables exist
-- ============================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('cobranzas', 'recibos', 'recibos_detalle')
ORDER BY table_name;

-- ============================================
-- 2. Verify Row Level Security is enabled
-- ============================================
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('cobranzas', 'recibos', 'recibos_detalle')
ORDER BY tablename;

-- ============================================
-- 3. Verify RLS policies exist
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('cobranzas', 'recibos', 'recibos_detalle')
ORDER BY tablename, policyname;

-- ============================================
-- 4. Verify triggers exist
-- ============================================
SELECT 
    trigger_schema,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('cobranzas', 'recibos', 'recibos_detalle')
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 5. Verify foreign key relationships
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
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('cobranzas', 'recibos', 'recibos_detalle')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 6. Verify unique constraints
-- ============================================
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('cobranzas', 'recibos', 'recibos_detalle')
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================
-- 7. Verify indexes
-- ============================================
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('cobranzas', 'recibos', 'recibos_detalle')
ORDER BY tablename, indexname;

-- ============================================
-- 8. Verify column definitions for cobranzas
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
  AND table_name = 'cobranzas'
ORDER BY ordinal_position;

-- ============================================
-- 9. Verify column definitions for recibos
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
  AND table_name = 'recibos'
ORDER BY ordinal_position;

-- ============================================
-- 10. Verify column definitions for recibos_detalle
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
  AND table_name = 'recibos_detalle'
ORDER BY ordinal_position;

-- ============================================
-- 11. Verify check constraints
-- ============================================
SELECT
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints AS tc
JOIN information_schema.check_constraints AS cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('cobranzas', 'recibos', 'recibos_detalle')
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================
-- 12. Count records in each table (should be 0 initially)
-- ============================================
SELECT 'cobranzas' AS table_name, COUNT(*) AS record_count FROM cobranzas
UNION ALL
SELECT 'recibos' AS table_name, COUNT(*) AS record_count FROM recibos
UNION ALL
SELECT 'recibos_detalle' AS table_name, COUNT(*) AS record_count FROM recibos_detalle;

-- ============================================
-- Summary
-- ============================================
SELECT 
    'FASE 4 Verification Complete' AS status,
    '3 tables should exist' AS tables_expected,
    '3 tables with RLS enabled' AS rls_expected,
    '3 RLS policies (one per table)' AS policies_expected,
    '3 triggers (one per table)' AS triggers_expected,
    '5 foreign keys total' AS fk_expected,
    '3 unique constraints' AS unique_constraints_expected,
    '14 indexes total' AS indexes_expected;
