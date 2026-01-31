-- Verification queries for FASE 3 schema
-- Run these queries after applying the FASE 3 migration to verify everything was created correctly

-- ============================================
-- 1. Verify tables were created
-- ============================================
SELECT 
    'Table Verification' as check_type,
    tablename,
    CASE 
        WHEN tablename IN ('facturas', 'facturas_detalle', 'notas_credito') THEN '✓ PASS'
        ELSE '✗ FAIL'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('facturas', 'facturas_detalle', 'notas_credito')
ORDER BY tablename;

-- ============================================
-- 2. Verify RLS is enabled
-- ============================================
SELECT 
    'RLS Verification' as check_type,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✓ ENABLED'
        ELSE '✗ DISABLED'
    END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public' 
    AND tablename IN ('facturas', 'facturas_detalle', 'notas_credito')
ORDER BY tablename;

-- ============================================
-- 3. Verify RLS policies exist
-- ============================================
SELECT 
    'Policy Verification' as check_type,
    tablename,
    policyname,
    CASE 
        WHEN policyname = 'Usuarios autenticados tienen acceso completo' THEN '✓ CORRECT'
        ELSE '✗ UNEXPECTED'
    END as status,
    cmd as applies_to
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename IN ('facturas', 'facturas_detalle', 'notas_credito')
ORDER BY tablename;

-- ============================================
-- 4. Verify triggers exist
-- ============================================
SELECT 
    'Trigger Verification' as check_type,
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE 
        WHEN tgname LIKE '%updated_at%' THEN '✓ FOUND'
        ELSE '✗ MISSING'
    END as status
FROM pg_trigger
WHERE tgrelid::regclass::text IN ('facturas', 'facturas_detalle', 'notas_credito')
    AND tgname NOT LIKE '%pg_%' -- Exclude system triggers
ORDER BY tgrelid::regclass;

-- ============================================
-- 5. Verify foreign key constraints
-- ============================================
SELECT 
    'Foreign Key Verification' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column,
    rc.delete_rule as on_delete
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
    AND tc.table_name IN ('facturas', 'facturas_detalle', 'notas_credito')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 6. Verify unique constraints
-- ============================================
SELECT 
    'Unique Constraint Verification' as check_type,
    tc.table_name,
    tc.constraint_name,
    STRING_AGG(kcu.column_name, ', ') as columns
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE' 
    AND tc.table_name IN ('facturas', 'facturas_detalle', 'notas_credito')
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- ============================================
-- 7. Verify indexes
-- ============================================
SELECT 
    'Index Verification' as check_type,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename IN ('facturas', 'facturas_detalle', 'notas_credito')
ORDER BY tablename, indexname;

-- ============================================
-- 8. Verify column definitions for facturas
-- ============================================
SELECT 
    'Column Verification - facturas' as check_type,
    column_name,
    data_type,
    CASE 
        WHEN is_nullable = 'NO' THEN 'NOT NULL'
        ELSE 'NULLABLE'
    END as nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'facturas'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- 9. Verify column definitions for facturas_detalle
-- ============================================
SELECT 
    'Column Verification - facturas_detalle' as check_type,
    column_name,
    data_type,
    CASE 
        WHEN is_nullable = 'NO' THEN 'NOT NULL'
        ELSE 'NULLABLE'
    END as nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'facturas_detalle'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- 10. Verify column definitions for notas_credito
-- ============================================
SELECT 
    'Column Verification - notas_credito' as check_type,
    column_name,
    data_type,
    CASE 
        WHEN is_nullable = 'NO' THEN 'NOT NULL'
        ELSE 'NULLABLE'
    END as nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'notas_credito'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- 11. Verify check constraints
-- ============================================
SELECT 
    'Check Constraint Verification' as check_type,
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints AS tc
JOIN information_schema.check_constraints AS cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK' 
    AND tc.table_name IN ('facturas', 'facturas_detalle', 'notas_credito')
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================
-- 12. Count records in new tables (should be 0 initially)
-- ============================================
SELECT 
    'Record Count' as check_type,
    'facturas' as table_name,
    COUNT(*) as record_count
FROM facturas
UNION ALL
SELECT 
    'Record Count',
    'facturas_detalle',
    COUNT(*)
FROM facturas_detalle
UNION ALL
SELECT 
    'Record Count',
    'notas_credito',
    COUNT(*)
FROM notas_credito;

-- ============================================
-- Summary
-- ============================================
-- Expected results:
-- 1. 3 tables created (facturas, facturas_detalle, notas_credito)
-- 2. 3 tables with RLS enabled
-- 3. 3 RLS policies for authenticated users
-- 4. 3 updated_at triggers
-- 5. Foreign keys:
--    - facturas: 2 FKs (periodo_id, obra_social_id)
--    - facturas_detalle: 3 FKs (factura_id, traslado_mensual_id, paciente_id)
--    - notas_credito: 2 FKs (factura_id, obra_social_id)
-- 6. Unique constraints:
--    - facturas.numero_factura
--    - notas_credito.numero_nota
-- 7. Indexes: 13 total (5 on facturas, 3 on facturas_detalle, 5 on notas_credito)
-- 8. Check constraints for non-negative amounts and date validation
-- 9. All records should be 0 initially
