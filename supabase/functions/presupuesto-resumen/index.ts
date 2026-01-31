import { createSupabaseClient } from '../_shared/supabase.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getPeriodo, validatePeriodo, redondear } from '../_shared/utils.ts';

/**
 * GET /presupuesto/resumen/:mes/:anio
 * Returns monthly budget summary with income, expenses, and balance
 * 
 * Path parameters:
 * - mes: Month (1-12)
 * - anio: Year (e.g., 2026)
 * 
 * Business logic:
 * - Income: Sum of facturas.monto_total for the period (estado: emitida, pagada)
 * - Expenses: Sum of:
 *   - gastos_operativos.monto (estado: aprobado, pagado)
 *   - liquidaciones_conductores.monto_neto (estado: aprobada, pagada)
 * - Balance: Income - Expenses
 */
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return errorResponse('Método no permitido', 405);
  }

  try {
    const supabase = createSupabaseClient(req);
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Extract mes and anio from path
    // Expected: /presupuesto/resumen/1/2026
    const mesIndex = pathParts.indexOf('resumen') + 1;
    const mes = parseInt(pathParts[mesIndex]);
    const anio = parseInt(pathParts[mesIndex + 1]);

    // Validate input
    if (!mes || !anio || isNaN(mes) || isNaN(anio)) {
      return errorResponse('Se requieren mes y anio válidos en la URL', 400);
    }

    if (!validatePeriodo(mes, anio)) {
      return errorResponse('Mes debe ser entre 1-12 y año entre 2000-2100', 400);
    }

    const periodo = getPeriodo(mes, anio);

    // Step 1: Find periodo_facturacion
    const { data: periodoData, error: periodoError } = await supabase
      .from('periodos_facturacion')
      .select('*')
      .eq('periodo', periodo)
      .single();

    if (periodoError) {
      return errorResponse('Periodo de facturación no encontrado', 404, periodoError);
    }

    // Step 2: Calculate income from facturas
    const { data: facturas, error: facturasError } = await supabase
      .from('facturas')
      .select('monto_total, estado')
      .eq('periodo_id', periodoData.id)
      .in('estado', ['emitida', 'pagada']);

    if (facturasError) {
      return errorResponse('Error al obtener facturas', 500, facturasError);
    }

    const ingresoFacturas = facturas?.reduce((sum, f) => sum + (f.monto_total || 0), 0) || 0;
    const facturasEmitidas = facturas?.filter(f => f.estado === 'emitida').length || 0;
    const facturasPagadas = facturas?.filter(f => f.estado === 'pagada').length || 0;

    // Step 3: Calculate operational expenses
    const { data: gastos, error: gastosError } = await supabase
      .from('gastos_operativos')
      .select('monto, tipo_gasto')
      .eq('periodo_id', periodoData.id)
      .in('estado', ['aprobado', 'pagado']);

    if (gastosError) {
      return errorResponse('Error al obtener gastos operativos', 500, gastosError);
    }

    const egresoGastos = gastos?.reduce((sum, g) => sum + (g.monto || 0), 0) || 0;

    // Group gastos by type
    const gastosPorTipo = {};
    gastos?.forEach(g => {
      const tipo = g.tipo_gasto || 'otros';
      gastosPorTipo[tipo] = (gastosPorTipo[tipo] || 0) + (g.monto || 0);
    });

    // Step 4: Calculate driver settlements
    const { data: liquidaciones, error: liquidacionesError } = await supabase
      .from('liquidaciones_conductores')
      .select('monto_neto, estado')
      .eq('periodo_id', periodoData.id)
      .in('estado', ['aprobada', 'pagada']);

    if (liquidacionesError) {
      return errorResponse('Error al obtener liquidaciones', 500, liquidacionesError);
    }

    const egresoLiquidaciones = liquidaciones?.reduce((sum, l) => sum + (l.monto_neto || 0), 0) || 0;
    const liquidacionesAprobadas = liquidaciones?.filter(l => l.estado === 'aprobada').length || 0;
    const liquidacionesPagadas = liquidaciones?.filter(l => l.estado === 'pagada').length || 0;

    // Step 5: Calculate totals and balance
    const totalIngresos = redondear(ingresoFacturas);
    const totalEgresos = redondear(egresoGastos + egresoLiquidaciones);
    const balance = redondear(totalIngresos - totalEgresos);

    // Step 6: Get additional statistics
    const { data: trasladosStats } = await supabase
      .from('traslados_mensuales')
      .select('cantidad_traslados, monto_total')
      .eq('periodo_id', periodoData.id);

    const totalTraslados = trasladosStats?.reduce((sum, t) => sum + (t.cantidad_traslados || 0), 0) || 0;
    const totalPacientes = trasladosStats?.length || 0;

    return successResponse({
      periodo: {
        periodo: periodo,
        mes: mes,
        anio: anio,
        fecha_inicio: periodoData.fecha_inicio,
        fecha_fin: periodoData.fecha_fin,
        estado: periodoData.estado,
      },
      ingresos: {
        total: totalIngresos,
        facturas: {
          monto: redondear(ingresoFacturas),
          cantidad: (facturas?.length || 0),
          emitidas: facturasEmitidas,
          pagadas: facturasPagadas,
        },
      },
      egresos: {
        total: totalEgresos,
        gastos_operativos: {
          monto: redondear(egresoGastos),
          cantidad: (gastos?.length || 0),
          por_tipo: gastosPorTipo,
        },
        liquidaciones_conductores: {
          monto: redondear(egresoLiquidaciones),
          cantidad: (liquidaciones?.length || 0),
          aprobadas: liquidacionesAprobadas,
          pagadas: liquidacionesPagadas,
        },
      },
      balance: {
        monto: balance,
        porcentaje_margen: totalIngresos > 0 
          ? redondear((balance / totalIngresos) * 100) 
          : 0,
      },
      estadisticas: {
        total_traslados: totalTraslados,
        total_pacientes: totalPacientes,
        ingreso_promedio_por_traslado: totalTraslados > 0 
          ? redondear(totalIngresos / totalTraslados) 
          : 0,
      },
    });

  } catch (error) {
    console.error('Error generando resumen de presupuesto:', error);
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
