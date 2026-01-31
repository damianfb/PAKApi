-- FASE 7: Create reporting views and functions for PAKApi
-- Migration: 00008_create_fase7_reporting_views.sql
-- Purpose: Create database views to support reports and dashboards

-- ============================================
-- 1. View: Facturación Anual (Annual Billing)
-- ============================================
-- Aggregates invoices by year and provides totals for billing analysis
CREATE OR REPLACE VIEW vista_facturacion_anual AS
SELECT 
    EXTRACT(YEAR FROM f.fecha_emision)::INTEGER AS anio,
    os.id AS obra_social_id,
    os.nombre AS obra_social,
    COUNT(f.id) AS total_facturas,
    SUM(f.subtotal) AS subtotal_total,
    SUM(f.impuestos) AS impuestos_total,
    SUM(f.monto_total) AS monto_total,
    SUM(CASE WHEN f.estado = 'pagada' THEN f.monto_total ELSE 0 END) AS monto_pagado,
    SUM(CASE WHEN f.estado IN ('borrador', 'emitida') THEN f.monto_total ELSE 0 END) AS monto_pendiente,
    COUNT(CASE WHEN f.estado = 'pagada' THEN 1 END) AS facturas_pagadas,
    COUNT(CASE WHEN f.estado IN ('borrador', 'emitida') THEN 1 END) AS facturas_pendientes,
    COUNT(CASE WHEN f.estado = 'anulada' THEN 1 END) AS facturas_anuladas
FROM facturas f
LEFT JOIN obras_sociales os ON f.obra_social_id = os.id
GROUP BY EXTRACT(YEAR FROM f.fecha_emision), os.id, os.nombre;

-- Enable RLS on view
ALTER VIEW vista_facturacion_anual SET (security_invoker = true);

-- ============================================
-- 2. View: Cobranzas Pendientes (Pending Collections)
-- ============================================
-- Lists all pending and partial collections with aging information
CREATE OR REPLACE VIEW vista_cobranzas_pendientes AS
SELECT 
    c.id,
    c.numero_cobranza,
    c.fecha_cobranza,
    c.fecha_vencimiento,
    os.id AS obra_social_id,
    os.nombre AS obra_social,
    os.telefono AS obra_social_telefono,
    os.email AS obra_social_email,
    pf.periodo,
    c.monto_total,
    c.monto_cobrado,
    c.monto_pendiente,
    c.estado,
    CASE 
        WHEN c.fecha_vencimiento IS NULL THEN 0
        WHEN c.fecha_vencimiento >= CURRENT_DATE THEN 0
        ELSE (CURRENT_DATE - c.fecha_vencimiento)
    END AS dias_vencido,
    CASE 
        WHEN c.fecha_vencimiento IS NULL THEN 'Sin vencimiento'
        WHEN c.fecha_vencimiento >= CURRENT_DATE THEN 'Vigente'
        WHEN (CURRENT_DATE - c.fecha_vencimiento) <= 30 THEN '1-30 días'
        WHEN (CURRENT_DATE - c.fecha_vencimiento) <= 60 THEN '31-60 días'
        WHEN (CURRENT_DATE - c.fecha_vencimiento) <= 90 THEN '61-90 días'
        ELSE 'Más de 90 días'
    END AS categoria_vencimiento,
    c.observaciones,
    c.updated_at
FROM cobranzas c
LEFT JOIN obras_sociales os ON c.obra_social_id = os.id
LEFT JOIN periodos_facturacion pf ON c.periodo_id = pf.id
WHERE c.estado IN ('pendiente', 'parcial')
ORDER BY c.fecha_vencimiento ASC NULLS LAST, c.monto_pendiente DESC;

-- Enable RLS on view
ALTER VIEW vista_cobranzas_pendientes SET (security_invoker = true);

-- ============================================
-- 3. View: Pacientes por Obra Social (Patients by Health Insurance)
-- ============================================
-- Aggregates patients and their services by health insurance company
CREATE OR REPLACE VIEW vista_pacientes_obra_social AS
SELECT 
    os.id AS obra_social_id,
    os.nombre AS obra_social,
    os.codigo AS obra_social_codigo,
    COUNT(DISTINCT p.id) AS total_pacientes,
    COUNT(DISTINCT CASE WHEN p.activo = true THEN p.id END) AS pacientes_activos,
    COUNT(DISTINCT CASE WHEN p.activo = false THEN p.id END) AS pacientes_inactivos,
    COUNT(DISTINCT sp.id) AS total_servicios,
    COUNT(DISTINCT CASE WHEN sp.activo = true THEN sp.id END) AS servicios_activos,
    COUNT(DISTINCT CASE WHEN sp.tipo_servicio = 'ambulancia' THEN sp.id END) AS servicios_ambulancia,
    COUNT(DISTINCT CASE WHEN sp.tipo_servicio = 'traslado' THEN sp.id END) AS servicios_traslado,
    COUNT(DISTINCT CASE WHEN sp.tipo_servicio = 'emergencia' THEN sp.id END) AS servicios_emergencia,
    COALESCE(SUM(tm.cantidad_realizada), 0) AS total_traslados_realizados,
    COALESCE(SUM(tm.monto_obra_social), 0) AS monto_total_obra_social,
    COALESCE(SUM(tm.monto_paciente), 0) AS monto_total_paciente
FROM obras_sociales os
LEFT JOIN pacientes p ON os.id = p.obra_social_id
LEFT JOIN servicios_paciente sp ON p.id = sp.paciente_id
LEFT JOIN traslados_mensuales tm ON p.id = tm.paciente_id AND os.id = tm.obra_social_id
WHERE os.activo = true
GROUP BY os.id, os.nombre, os.codigo;

-- Enable RLS on view
ALTER VIEW vista_pacientes_obra_social SET (security_invoker = true);

-- ============================================
-- 4. View: Rentabilidad Mensual (Monthly Profitability)
-- ============================================
-- Calculates monthly profitability by comparing income and expenses
CREATE OR REPLACE VIEW vista_rentabilidad_mensual AS
WITH ingresos AS (
    SELECT 
        pf.id AS periodo_id,
        pf.periodo,
        EXTRACT(YEAR FROM pf.fecha_inicio)::INTEGER AS anio,
        EXTRACT(MONTH FROM pf.fecha_inicio)::INTEGER AS mes,
        COALESCE(SUM(f.monto_total), 0) AS facturacion_total,
        COALESCE(SUM(CASE WHEN f.estado = 'pagada' THEN f.monto_total ELSE 0 END), 0) AS facturacion_cobrada,
        COUNT(DISTINCT f.id) AS total_facturas,
        COALESCE(SUM(tm.cantidad_realizada), 0) AS traslados_realizados
    FROM periodos_facturacion pf
    LEFT JOIN facturas f ON pf.id = f.periodo_id
    LEFT JOIN traslados_mensuales tm ON pf.id = tm.periodo_id
    GROUP BY pf.id, pf.periodo, pf.fecha_inicio
),
egresos AS (
    SELECT 
        pf.id AS periodo_id,
        COALESCE(SUM(go.monto), 0) AS gastos_operativos,
        COUNT(DISTINCT go.id) AS total_gastos,
        COALESCE(SUM(lc.monto_neto), 0) AS liquidaciones_conductores,
        COUNT(DISTINCT lc.id) AS total_liquidaciones
    FROM periodos_facturacion pf
    LEFT JOIN gastos_operativos go ON pf.id = go.periodo_id AND go.estado != 'anulado'
    LEFT JOIN liquidaciones_conductores lc ON pf.id = lc.periodo_id AND lc.estado != 'anulado'
    GROUP BY pf.id
)
SELECT 
    i.periodo_id,
    i.periodo,
    i.anio,
    i.mes,
    i.facturacion_total,
    i.facturacion_cobrada,
    i.total_facturas,
    i.traslados_realizados,
    e.gastos_operativos,
    e.total_gastos,
    e.liquidaciones_conductores,
    e.total_liquidaciones,
    (e.gastos_operativos + e.liquidaciones_conductores) AS egresos_totales,
    (i.facturacion_total - (e.gastos_operativos + e.liquidaciones_conductores)) AS utilidad_bruta,
    (i.facturacion_cobrada - (e.gastos_operativos + e.liquidaciones_conductores)) AS utilidad_neta,
    CASE 
        WHEN i.facturacion_total > 0 
        THEN ROUND(((i.facturacion_total - (e.gastos_operativos + e.liquidaciones_conductores)) / i.facturacion_total * 100), 2)
        ELSE 0 
    END AS margen_bruto_porcentaje,
    CASE 
        WHEN i.traslados_realizados > 0 
        THEN ROUND((i.facturacion_total / i.traslados_realizados), 2)
        ELSE 0 
    END AS ingreso_promedio_traslado,
    CASE 
        WHEN i.traslados_realizados > 0 
        THEN ROUND(((e.gastos_operativos + e.liquidaciones_conductores) / i.traslados_realizados), 2)
        ELSE 0 
    END AS costo_promedio_traslado
FROM ingresos i
LEFT JOIN egresos e ON i.periodo_id = e.periodo_id
ORDER BY i.anio DESC, i.mes DESC;

-- Enable RLS on view
ALTER VIEW vista_rentabilidad_mensual SET (security_invoker = true);

-- ============================================
-- 5. View: Resumen Anual (Annual Summary)
-- ============================================
-- Comprehensive annual summary with key metrics and KPIs
CREATE OR REPLACE VIEW vista_resumen_anual AS
WITH metricas_facturacion AS (
    SELECT 
        EXTRACT(YEAR FROM f.fecha_emision)::INTEGER AS anio,
        COUNT(DISTINCT f.id) AS total_facturas,
        SUM(f.monto_total) AS facturacion_total,
        SUM(CASE WHEN f.estado = 'pagada' THEN f.monto_total ELSE 0 END) AS facturacion_cobrada,
        COUNT(DISTINCT f.obra_social_id) AS obras_sociales_facturadas
    FROM facturas f
    GROUP BY EXTRACT(YEAR FROM f.fecha_emision)
),
metricas_cobranzas AS (
    SELECT 
        EXTRACT(YEAR FROM c.fecha_cobranza)::INTEGER AS anio,
        COUNT(DISTINCT c.id) AS total_cobranzas,
        SUM(c.monto_total) AS cobranzas_total,
        SUM(c.monto_cobrado) AS cobranzas_cobrado,
        SUM(c.monto_pendiente) AS cobranzas_pendiente
    FROM cobranzas c
    WHERE c.estado != 'anulado'
    GROUP BY EXTRACT(YEAR FROM c.fecha_cobranza)
),
metricas_traslados AS (
    SELECT 
        EXTRACT(YEAR FROM pf.fecha_inicio)::INTEGER AS anio,
        SUM(tm.cantidad_realizada) AS total_traslados,
        COUNT(DISTINCT tm.paciente_id) AS pacientes_atendidos,
        COUNT(DISTINCT tm.obra_social_id) AS obras_sociales_atendidas
    FROM traslados_mensuales tm
    JOIN periodos_facturacion pf ON tm.periodo_id = pf.id
    GROUP BY EXTRACT(YEAR FROM pf.fecha_inicio)
),
metricas_gastos AS (
    SELECT 
        EXTRACT(YEAR FROM go.fecha)::INTEGER AS anio,
        COUNT(DISTINCT go.id) AS total_gastos,
        SUM(go.monto) AS gastos_operativos_total,
        SUM(CASE WHEN go.tipo_gasto = 'combustible' THEN go.monto ELSE 0 END) AS gastos_combustible,
        SUM(CASE WHEN go.tipo_gasto = 'mantenimiento' THEN go.monto ELSE 0 END) AS gastos_mantenimiento
    FROM gastos_operativos go
    WHERE go.estado != 'anulado'
    GROUP BY EXTRACT(YEAR FROM go.fecha)
),
metricas_liquidaciones AS (
    SELECT 
        EXTRACT(YEAR FROM pf.fecha_inicio)::INTEGER AS anio,
        COUNT(DISTINCT lc.id) AS total_liquidaciones,
        SUM(lc.monto_neto) AS liquidaciones_total,
        COUNT(DISTINCT lc.conductor_id) AS conductores_liquidados
    FROM liquidaciones_conductores lc
    JOIN periodos_facturacion pf ON lc.periodo_id = pf.id
    WHERE lc.estado != 'anulado'
    GROUP BY EXTRACT(YEAR FROM pf.fecha_inicio)
)
SELECT 
    COALESCE(mf.anio, mc.anio, mt.anio, mg.anio, ml.anio) AS anio,
    -- Facturación
    COALESCE(mf.total_facturas, 0) AS total_facturas,
    COALESCE(mf.facturacion_total, 0) AS facturacion_total,
    COALESCE(mf.facturacion_cobrada, 0) AS facturacion_cobrada,
    COALESCE(mf.obras_sociales_facturadas, 0) AS obras_sociales_facturadas,
    -- Cobranzas
    COALESCE(mc.total_cobranzas, 0) AS total_cobranzas,
    COALESCE(mc.cobranzas_total, 0) AS cobranzas_total,
    COALESCE(mc.cobranzas_cobrado, 0) AS cobranzas_cobrado,
    COALESCE(mc.cobranzas_pendiente, 0) AS cobranzas_pendiente,
    -- Traslados
    COALESCE(mt.total_traslados, 0) AS total_traslados,
    COALESCE(mt.pacientes_atendidos, 0) AS pacientes_atendidos,
    COALESCE(mt.obras_sociales_atendidas, 0) AS obras_sociales_atendidas,
    -- Gastos
    COALESCE(mg.total_gastos, 0) AS total_gastos,
    COALESCE(mg.gastos_operativos_total, 0) AS gastos_operativos_total,
    COALESCE(mg.gastos_combustible, 0) AS gastos_combustible,
    COALESCE(mg.gastos_mantenimiento, 0) AS gastos_mantenimiento,
    -- Liquidaciones
    COALESCE(ml.total_liquidaciones, 0) AS total_liquidaciones,
    COALESCE(ml.liquidaciones_total, 0) AS liquidaciones_total,
    COALESCE(ml.conductores_liquidados, 0) AS conductores_liquidados,
    -- Cálculos derivados
    (COALESCE(mf.facturacion_total, 0) - COALESCE(mg.gastos_operativos_total, 0) - COALESCE(ml.liquidaciones_total, 0)) AS utilidad_neta,
    CASE 
        WHEN COALESCE(mf.facturacion_total, 0) > 0 
        THEN ROUND(((COALESCE(mf.facturacion_total, 0) - COALESCE(mg.gastos_operativos_total, 0) - COALESCE(ml.liquidaciones_total, 0)) / COALESCE(mf.facturacion_total, 0) * 100), 2)
        ELSE 0 
    END AS margen_neto_porcentaje,
    CASE 
        WHEN COALESCE(mt.total_traslados, 0) > 0 
        THEN ROUND((COALESCE(mf.facturacion_total, 0) / COALESCE(mt.total_traslados, 0)), 2)
        ELSE 0 
    END AS ingreso_promedio_traslado,
    CASE 
        WHEN COALESCE(mf.facturacion_total, 0) > 0 
        THEN ROUND((COALESCE(mf.facturacion_cobrada, 0) / COALESCE(mf.facturacion_total, 0) * 100), 2)
        ELSE 0 
    END AS porcentaje_cobranza
FROM metricas_facturacion mf
FULL OUTER JOIN metricas_cobranzas mc ON mf.anio = mc.anio
FULL OUTER JOIN metricas_traslados mt ON COALESCE(mf.anio, mc.anio) = mt.anio
FULL OUTER JOIN metricas_gastos mg ON COALESCE(mf.anio, mc.anio, mt.anio) = mg.anio
FULL OUTER JOIN metricas_liquidaciones ml ON COALESCE(mf.anio, mc.anio, mt.anio, mg.anio) = ml.anio
ORDER BY anio DESC;

-- Enable RLS on view
ALTER VIEW vista_resumen_anual SET (security_invoker = true);

-- ============================================
-- 6. View: Dashboard General (General Dashboard)
-- ============================================
-- Provides current state metrics for a general dashboard
CREATE OR REPLACE VIEW vista_dashboard_general AS
SELECT
    -- Pacientes
    (SELECT COUNT(*) FROM pacientes WHERE activo = true) AS pacientes_activos,
    (SELECT COUNT(*) FROM pacientes) AS pacientes_totales,
    -- Servicios
    (SELECT COUNT(*) FROM servicios_paciente WHERE activo = true) AS servicios_activos,
    (SELECT COUNT(*) FROM servicios_paciente) AS servicios_totales,
    -- Conductores
    (SELECT COUNT(*) FROM conductores WHERE activo = true) AS conductores_activos,
    (SELECT COUNT(*) FROM conductores) AS conductores_totales,
    -- Obras Sociales
    (SELECT COUNT(*) FROM obras_sociales WHERE activo = true) AS obras_sociales_activas,
    -- Facturas
    (SELECT COUNT(*) FROM facturas WHERE estado = 'emitida') AS facturas_emitidas,
    (SELECT COUNT(*) FROM facturas WHERE estado = 'pagada') AS facturas_pagadas,
    (SELECT SUM(monto_total) FROM facturas WHERE estado IN ('borrador', 'emitida')) AS facturas_pendientes_monto,
    -- Cobranzas
    (SELECT COUNT(*) FROM cobranzas WHERE estado IN ('pendiente', 'parcial')) AS cobranzas_pendientes,
    (SELECT SUM(monto_pendiente) FROM cobranzas WHERE estado IN ('pendiente', 'parcial')) AS cobranzas_pendientes_monto,
    (SELECT COUNT(*) FROM cobranzas WHERE estado IN ('pendiente', 'parcial') AND fecha_vencimiento < CURRENT_DATE) AS cobranzas_vencidas,
    (SELECT SUM(monto_pendiente) FROM cobranzas WHERE estado IN ('pendiente', 'parcial') AND fecha_vencimiento < CURRENT_DATE) AS cobranzas_vencidas_monto,
    -- Traslados del mes actual
    (SELECT SUM(tm.cantidad_realizada) 
     FROM traslados_mensuales tm 
     JOIN periodos_facturacion pf ON tm.periodo_id = pf.id 
     WHERE pf.periodo = TO_CHAR(CURRENT_DATE, 'YYYY-MM')) AS traslados_mes_actual,
    -- Gastos del mes actual
    (SELECT SUM(go.monto) 
     FROM gastos_operativos go 
     JOIN periodos_facturacion pf ON go.periodo_id = pf.id 
     WHERE pf.periodo = TO_CHAR(CURRENT_DATE, 'YYYY-MM') AND go.estado != 'anulado') AS gastos_mes_actual,
    -- Última actualización
    NOW() AS fecha_actualizacion;

-- Enable RLS on view
ALTER VIEW vista_dashboard_general SET (security_invoker = true);

-- ============================================
-- Grant permissions on views to authenticated users
-- ============================================
GRANT SELECT ON vista_facturacion_anual TO authenticated;
GRANT SELECT ON vista_cobranzas_pendientes TO authenticated;
GRANT SELECT ON vista_pacientes_obra_social TO authenticated;
GRANT SELECT ON vista_rentabilidad_mensual TO authenticated;
GRANT SELECT ON vista_resumen_anual TO authenticated;
GRANT SELECT ON vista_dashboard_general TO authenticated;

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON VIEW vista_facturacion_anual IS 'Resumen de facturación agrupado por año y obra social';
COMMENT ON VIEW vista_cobranzas_pendientes IS 'Listado de cobranzas pendientes con información de vencimiento';
COMMENT ON VIEW vista_pacientes_obra_social IS 'Estadísticas de pacientes y servicios agrupados por obra social';
COMMENT ON VIEW vista_rentabilidad_mensual IS 'Análisis de rentabilidad mensual comparando ingresos vs egresos';
COMMENT ON VIEW vista_resumen_anual IS 'Resumen anual consolidado con métricas clave del negocio';
COMMENT ON VIEW vista_dashboard_general IS 'Métricas actuales para dashboard principal';
