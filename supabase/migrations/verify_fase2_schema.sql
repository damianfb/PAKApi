-- Verification queries for FASE 2 tables
-- Run these queries to verify the schema was created correctly

-- ============================================
-- 1. Verify tables exist
-- ============================================
SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE tablename IN ('servicios_paciente', 'periodos_facturacion', 'traslados_mensuales')
ORDER BY tablename;

-- ============================================
-- 2. Verify Row Level Security is enabled
-- ============================================
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('servicios_paciente', 'periodos_facturacion', 'traslados_mensuales')
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
WHERE tablename IN ('servicios_paciente', 'periodos_facturacion', 'traslados_mensuales')
ORDER BY tablename;

-- ============================================
-- 4. Verify updated_at triggers exist
-- ============================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers
WHERE event_object_table IN ('servicios_paciente', 'periodos_facturacion', 'traslados_mensuales')
ORDER BY event_object_table;

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
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('servicios_paciente', 'periodos_facturacion', 'traslados_mensuales')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 6. Verify unique constraints
-- ============================================
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE' 
    AND tc.table_name IN ('servicios_paciente', 'periodos_facturacion', 'traslados_mensuales')
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name;

-- ============================================
-- 7. Verify indexes
-- ============================================
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('servicios_paciente', 'periodos_facturacion', 'traslados_mensuales')
ORDER BY tablename, indexname;

-- ============================================
-- 8. Verify column definitions
-- ============================================
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('servicios_paciente', 'periodos_facturacion', 'traslados_mensuales')
ORDER BY table_name, ordinal_position;

-- ============================================
-- 9. Verify check constraints
-- ============================================
SELECT
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints AS tc
JOIN information_schema.check_constraints AS cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN ('servicios_paciente', 'periodos_facturacion', 'traslados_mensuales')
    AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name;

-- ============================================
-- 10. Count records in each table
-- ============================================
SELECT 'servicios_paciente' AS table_name, COUNT(*) AS record_count FROM servicios_paciente
UNION ALL
SELECT 'periodos_facturacion' AS table_name, COUNT(*) AS record_count FROM periodos_facturacion
UNION ALL
SELECT 'traslados_mensuales' AS table_name, COUNT(*) AS record_count FROM traslados_mensuales;
