-- Verification queries for FASE 1 tables
-- Run these queries to verify the tables were created correctly

-- ============================================
-- 1. Verify table existence
-- ============================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('obras_sociales', 'conductores', 'destinos', 'pacientes')
ORDER BY table_name;

-- ============================================
-- 2. Verify RLS is enabled
-- ============================================
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('obras_sociales', 'conductores', 'destinos', 'pacientes');

-- ============================================
-- 3. Verify policies exist
-- ============================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('obras_sociales', 'conductores', 'destinos', 'pacientes')
ORDER BY tablename;

-- ============================================
-- 4. Verify triggers
-- ============================================
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('obras_sociales', 'conductores', 'destinos', 'pacientes')
ORDER BY event_object_table;

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
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('obras_sociales', 'conductores', 'destinos', 'pacientes');

-- ============================================
-- 6. Verify indexes
-- ============================================
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('obras_sociales', 'conductores', 'destinos', 'pacientes')
ORDER BY tablename, indexname;

-- ============================================
-- 7. Count records in each table
-- ============================================
SELECT 'obras_sociales' AS table_name, COUNT(*) AS record_count FROM obras_sociales
UNION ALL
SELECT 'conductores', COUNT(*) FROM conductores
UNION ALL
SELECT 'destinos', COUNT(*) FROM destinos
UNION ALL
SELECT 'pacientes', COUNT(*) FROM pacientes;

-- ============================================
-- 8. Sample data verification
-- ============================================
-- Check obras_sociales
SELECT id, nombre, codigo, activo 
FROM obras_sociales 
ORDER BY nombre 
LIMIT 5;

-- Check conductores
SELECT id, nombre, apellido, dni, activo 
FROM conductores 
ORDER BY apellido 
LIMIT 5;

-- Check destinos
SELECT id, nombre, tipo, ciudad 
FROM destinos 
ORDER BY nombre 
LIMIT 5;

-- ============================================
-- 9. Verify column definitions
-- ============================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('obras_sociales', 'conductores', 'destinos', 'pacientes')
ORDER BY table_name, ordinal_position;
