// Edge Function: reportes
// Purpose: Provides reporting endpoints for PAKApi
// Endpoints:
//   GET /reportes/facturacion-anual - Annual billing report
//   GET /reportes/cobranzas-pendientes - Pending collections report
//   GET /reportes/pacientes-obra-social - Patients by health insurance report
//   GET /reportes/rentabilidad-mensual - Monthly profitability report
//   GET /reportes/resumen-anual - Annual summary report
//   GET /reportes/dashboard - General dashboard metrics

import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient } from '../_shared/supabase.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient(req);
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Extract report type from path
    // Expected format: /reportes/{report-type}
    const pathParts = pathname.split('/').filter(p => p);
    const reportType = pathParts[pathParts.length - 1];

    // Only GET method is allowed for reports
    if (req.method !== 'GET') {
      return errorResponse('Method not allowed', 405);
    }

    // Route to appropriate report handler
    switch (reportType) {
      case 'facturacion-anual':
        return await getFacturacionAnual(supabase, url);
      case 'cobranzas-pendientes':
        return await getCobranzasPendientes(supabase, url);
      case 'pacientes-obra-social':
        return await getPacientesObraSocial(supabase, url);
      case 'rentabilidad-mensual':
        return await getRentabilidadMensual(supabase, url);
      case 'resumen-anual':
        return await getResumenAnual(supabase, url);
      case 'dashboard':
        return await getDashboard(supabase);
      default:
        return errorResponse(
          'Invalid report type. Available: facturacion-anual, cobranzas-pendientes, pacientes-obra-social, rentabilidad-mensual, resumen-anual, dashboard',
          400
        );
    }
  } catch (error) {
    console.error('Error in reportes function:', error);
    return errorResponse('Internal server error', 500, error.message);
  }
});

// ============================================
// Report Handlers
// ============================================

/**
 * Get annual billing report
 * Query params: anio (year), obra_social_id (optional)
 */
async function getFacturacionAnual(supabase: any, url: URL) {
  const anio = url.searchParams.get('anio');
  const obraSocialId = url.searchParams.get('obra_social_id');

  let query = supabase
    .from('vista_facturacion_anual')
    .select('*')
    .order('anio', { ascending: false })
    .order('monto_total', { ascending: false });

  // Apply filters
  if (anio) {
    query = query.eq('anio', parseInt(anio));
  }
  if (obraSocialId) {
    query = query.eq('obra_social_id', obraSocialId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching facturacion anual:', error);
    return errorResponse('Error fetching annual billing report', 500, error.message);
  }

  return successResponse({
    reporte: 'facturacion_anual',
    filtros: { anio, obra_social_id: obraSocialId },
    total_registros: data.length,
    datos: data
  });
}

/**
 * Get pending collections report
 * Query params: obra_social_id (optional), categoria_vencimiento (optional)
 */
async function getCobranzasPendientes(supabase: any, url: URL) {
  const obraSocialId = url.searchParams.get('obra_social_id');
  const categoriaVencimiento = url.searchParams.get('categoria_vencimiento');

  let query = supabase
    .from('vista_cobranzas_pendientes')
    .select('*')
    .order('dias_vencido', { ascending: false });

  // Apply filters
  if (obraSocialId) {
    query = query.eq('obra_social_id', obraSocialId);
  }
  if (categoriaVencimiento) {
    query = query.eq('categoria_vencimiento', categoriaVencimiento);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching cobranzas pendientes:', error);
    return errorResponse('Error fetching pending collections report', 500, error.message);
  }

  // Calculate summary statistics
  const totalPendiente = data.reduce((sum: number, item: any) => sum + parseFloat(item.monto_pendiente || 0), 0);
  const totalRegistros = data.length;

  return successResponse({
    reporte: 'cobranzas_pendientes',
    filtros: { obra_social_id: obraSocialId, categoria_vencimiento: categoriaVencimiento },
    resumen: {
      total_registros: totalRegistros,
      monto_total_pendiente: totalPendiente
    },
    datos: data
  });
}

/**
 * Get patients by health insurance report
 * Query params: obra_social_id (optional)
 */
async function getPacientesObraSocial(supabase: any, url: URL) {
  const obraSocialId = url.searchParams.get('obra_social_id');

  let query = supabase
    .from('vista_pacientes_obra_social')
    .select('*')
    .order('total_pacientes', { ascending: false });

  // Apply filters
  if (obraSocialId) {
    query = query.eq('obra_social_id', obraSocialId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching pacientes obra social:', error);
    return errorResponse('Error fetching patients by health insurance report', 500, error.message);
  }

  // Calculate summary statistics
  const totalPacientes = data.reduce((sum: number, item: any) => sum + parseInt(item.total_pacientes || 0), 0);
  const totalServicios = data.reduce((sum: number, item: any) => sum + parseInt(item.total_servicios || 0), 0);

  return successResponse({
    reporte: 'pacientes_obra_social',
    filtros: { obra_social_id: obraSocialId },
    resumen: {
      total_obras_sociales: data.length,
      total_pacientes: totalPacientes,
      total_servicios: totalServicios
    },
    datos: data
  });
}

/**
 * Get monthly profitability report
 * Query params: anio (year), mes (month), periodo (YYYY-MM)
 */
async function getRentabilidadMensual(supabase: any, url: URL) {
  const anio = url.searchParams.get('anio');
  const mes = url.searchParams.get('mes');
  const periodo = url.searchParams.get('periodo');

  let query = supabase
    .from('vista_rentabilidad_mensual')
    .select('*')
    .order('anio', { ascending: false })
    .order('mes', { ascending: false });

  // Apply filters
  if (periodo) {
    query = query.eq('periodo', periodo);
  } else {
    if (anio) {
      query = query.eq('anio', parseInt(anio));
    }
    if (mes) {
      query = query.eq('mes', parseInt(mes));
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching rentabilidad mensual:', error);
    return errorResponse('Error fetching monthly profitability report', 500, error.message);
  }

  // Calculate totals
  const totalFacturacion = data.reduce((sum: number, item: any) => sum + parseFloat(item.facturacion_total || 0), 0);
  const totalEgresos = data.reduce((sum: number, item: any) => sum + parseFloat(item.egresos_totales || 0), 0);
  const totalUtilidadNeta = data.reduce((sum: number, item: any) => sum + parseFloat(item.utilidad_neta || 0), 0);

  return successResponse({
    reporte: 'rentabilidad_mensual',
    filtros: { anio, mes, periodo },
    resumen: {
      total_periodos: data.length,
      facturacion_total: totalFacturacion,
      egresos_totales: totalEgresos,
      utilidad_neta_total: totalUtilidadNeta,
      margen_promedio: totalFacturacion > 0 ? ((totalUtilidadNeta / totalFacturacion) * 100).toFixed(2) : 0
    },
    datos: data
  });
}

/**
 * Get annual summary report
 * Query params: anio (year, optional)
 */
async function getResumenAnual(supabase: any, url: URL) {
  const anio = url.searchParams.get('anio');

  let query = supabase
    .from('vista_resumen_anual')
    .select('*')
    .order('anio', { ascending: false });

  // Apply filters
  if (anio) {
    query = query.eq('anio', parseInt(anio));
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching resumen anual:', error);
    return errorResponse('Error fetching annual summary report', 500, error.message);
  }

  return successResponse({
    reporte: 'resumen_anual',
    filtros: { anio },
    total_anios: data.length,
    datos: data
  });
}

/**
 * Get general dashboard metrics
 * No query params required
 */
async function getDashboard(supabase: any) {
  const { data, error } = await supabase
    .from('vista_dashboard_general')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching dashboard:', error);
    return errorResponse('Error fetching dashboard metrics', 500, error.message);
  }

  return successResponse({
    reporte: 'dashboard_general',
    datos: data,
    fecha_actualizacion: data.fecha_actualizacion
  });
}
