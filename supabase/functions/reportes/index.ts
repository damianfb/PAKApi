import { createSupabaseClient } from '../_shared/supabase.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { redondear, validatePeriodo, getPeriodo } from '../_shared/utils.ts';

/**
 * GET /reportes/*
 * Various report endpoints for analytics and business intelligence
 * 
 * Supported endpoints:
 * - GET /reportes/facturacion-anual/:anio - Annual billing report
 * - GET /reportes/cobranzas-pendientes - Pending collections report
 * - GET /reportes/pacientes-por-obra-social - Patients by health insurance
 * - GET /reportes/rentabilidad/:mes/:anio - Monthly profitability report
 * - GET /reportes/conductores-rendimiento/:mes/:anio - Driver performance report
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
    
    // Extract report type
    const reportIndex = pathParts.indexOf('reportes') + 1;
    const reportType = pathParts[reportIndex];

    if (!reportType) {
      return errorResponse('Tipo de reporte no especificado', 400);
    }

    // Route to appropriate report handler
    switch (reportType) {
      case 'facturacion-anual':
        return await reporteFacturacionAnual(supabase, pathParts, reportIndex);
      
      case 'cobranzas-pendientes':
        return await reporteCobranzasPendientes(supabase);
      
      case 'pacientes-por-obra-social':
        return await reportePacientesPorObraSocial(supabase);
      
      case 'rentabilidad':
        return await reporteRentabilidad(supabase, pathParts, reportIndex);
      
      case 'conductores-rendimiento':
        return await reporteConductoresRendimiento(supabase, pathParts, reportIndex);
      
      default:
        return errorResponse('Tipo de reporte no válido', 400);
    }

  } catch (error) {
    console.error('Error generando reporte:', error);
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});

/**
 * Annual billing report by month
 */
async function reporteFacturacionAnual(supabase: any, pathParts: string[], reportIndex: number) {
  const anio = parseInt(pathParts[reportIndex + 1]);
  
  if (!anio || isNaN(anio) || anio < 2000 || anio > 2100) {
    return errorResponse('Año no válido', 400);
  }

  // Get all periodos for the year
  const { data: periodos, error: periodosError } = await supabase
    .from('periodos_facturacion')
    .select('*')
    .like('periodo', `${anio}-%`)
    .order('periodo');

  if (periodosError) {
    return errorResponse('Error al obtener periodos', 500, periodosError);
  }

  // Get facturas for each periodo
  const resultados = [];
  let totalAnual = 0;
  let totalFacturas = 0;

  for (const periodo of periodos || []) {
    const { data: facturas, error: facturasError } = await supabase
      .from('facturas')
      .select('id, numero_factura, monto_total, estado, fecha_emision')
      .eq('periodo_id', periodo.id);

    if (facturasError) {
      console.error('Error getting facturas:', facturasError);
      continue;
    }

    const montoMes = facturas?.reduce((sum, f) => sum + (f.monto_total || 0), 0) || 0;
    totalAnual += montoMes;
    totalFacturas += facturas?.length || 0;

    resultados.push({
      periodo: periodo.periodo,
      mes: parseInt(periodo.periodo.split('-')[1]),
      fecha_inicio: periodo.fecha_inicio,
      fecha_fin: periodo.fecha_fin,
      estado: periodo.estado,
      cantidad_facturas: facturas?.length || 0,
      monto_total: redondear(montoMes),
      facturas_emitidas: facturas?.filter(f => f.estado === 'emitida').length || 0,
      facturas_pagadas: facturas?.filter(f => f.estado === 'pagada').length || 0,
    });
  }

  return successResponse({
    anio: anio,
    resumen: {
      total_anual: redondear(totalAnual),
      total_facturas: totalFacturas,
      promedio_mensual: resultados.length > 0 ? redondear(totalAnual / resultados.length) : 0,
      meses_con_datos: resultados.length,
    },
    por_mes: resultados,
  });
}

/**
 * Pending collections report
 */
async function reporteCobranzasPendientes(supabase: any) {
  // Get all cobranzas with estado pendiente or parcial
  const { data: cobranzas, error: cobranzasError } = await supabase
    .from('cobranzas')
    .select(`
      *,
      obra_social:obras_sociales(id, nombre, codigo),
      periodo:periodos_facturacion(periodo, fecha_inicio, fecha_fin)
    `)
    .in('estado', ['pendiente', 'parcial'])
    .order('fecha_vencimiento', { ascending: true });

  if (cobranzasError) {
    return errorResponse('Error al obtener cobranzas', 500, cobranzasError);
  }

  // Calculate totals
  const totalPendiente = cobranzas?.reduce((sum, c) => sum + (c.monto_pendiente || 0), 0) || 0;
  const totalVencidas = cobranzas?.filter(c => {
    return c.fecha_vencimiento && new Date(c.fecha_vencimiento) < new Date();
  }).length || 0;

  // Group by obra_social
  const porObraSocial = {};
  cobranzas?.forEach(c => {
    const osId = c.obra_social_id;
    if (!porObraSocial[osId]) {
      porObraSocial[osId] = {
        obra_social: c.obra_social,
        cantidad: 0,
        monto_pendiente: 0,
        cobranzas: [],
      };
    }
    porObraSocial[osId].cantidad++;
    porObraSocial[osId].monto_pendiente += c.monto_pendiente || 0;
    porObraSocial[osId].cobranzas.push({
      id: c.id,
      numero_cobranza: c.numero_cobranza,
      fecha_cobranza: c.fecha_cobranza,
      fecha_vencimiento: c.fecha_vencimiento,
      monto_pendiente: c.monto_pendiente,
      estado: c.estado,
      periodo: c.periodo?.periodo,
    });
  });

  return successResponse({
    resumen: {
      total_cobranzas: cobranzas?.length || 0,
      total_pendiente: redondear(totalPendiente),
      total_vencidas: totalVencidas,
    },
    por_obra_social: Object.values(porObraSocial).map((item: any) => ({
      ...item,
      monto_pendiente: redondear(item.monto_pendiente),
    })),
  });
}

/**
 * Patients by health insurance report
 */
async function reportePacientesPorObraSocial(supabase: any) {
  // Get all active pacientes with their obra_social
  const { data: pacientes, error: pacientesError } = await supabase
    .from('pacientes')
    .select(`
      id,
      nombre,
      apellido,
      dni,
      activo,
      obra_social:obras_sociales(id, nombre, codigo)
    `)
    .eq('activo', true)
    .order('obra_social_id');

  if (pacientesError) {
    return errorResponse('Error al obtener pacientes', 500, pacientesError);
  }

  // Group by obra_social
  const porObraSocial = {};
  let sinObraSocial = 0;

  pacientes?.forEach(p => {
    if (!p.obra_social) {
      sinObraSocial++;
      return;
    }

    const osId = p.obra_social.id;
    if (!porObraSocial[osId]) {
      porObraSocial[osId] = {
        obra_social: p.obra_social,
        cantidad_pacientes: 0,
        pacientes: [],
      };
    }
    porObraSocial[osId].cantidad_pacientes++;
    porObraSocial[osId].pacientes.push({
      id: p.id,
      nombre: p.nombre,
      apellido: p.apellido,
      dni: p.dni,
    });
  });

  // Sort by cantidad_pacientes
  const resultado = Object.values(porObraSocial).sort((a: any, b: any) => 
    b.cantidad_pacientes - a.cantidad_pacientes
  );

  return successResponse({
    resumen: {
      total_pacientes: pacientes?.length || 0,
      total_obras_sociales: resultado.length,
      pacientes_sin_obra_social: sinObraSocial,
    },
    por_obra_social: resultado,
  });
}

/**
 * Monthly profitability report
 */
async function reporteRentabilidad(supabase: any, pathParts: string[], reportIndex: number) {
  const mes = parseInt(pathParts[reportIndex + 1]);
  const anio = parseInt(pathParts[reportIndex + 2]);

  if (!mes || !anio || !validatePeriodo(mes, anio)) {
    return errorResponse('Mes y año no válidos', 400);
  }

  const periodo = getPeriodo(mes, anio);

  // Get periodo_facturacion
  const { data: periodoData, error: periodoError } = await supabase
    .from('periodos_facturacion')
    .select('*')
    .eq('periodo', periodo)
    .single();

  if (periodoError) {
    return errorResponse('Periodo no encontrado', 404, periodoError);
  }

  // Get facturas
  const { data: facturas } = await supabase
    .from('facturas')
    .select('monto_total')
    .eq('periodo_id', periodoData.id);

  const ingresos = facturas?.reduce((sum, f) => sum + (f.monto_total || 0), 0) || 0;

  // Get gastos
  const { data: gastos } = await supabase
    .from('gastos_operativos')
    .select('monto, tipo_gasto')
    .eq('periodo_id', periodoData.id);

  const egresosGastos = gastos?.reduce((sum, g) => sum + (g.monto || 0), 0) || 0;

  // Get liquidaciones
  const { data: liquidaciones } = await supabase
    .from('liquidaciones_conductores')
    .select('monto_neto')
    .eq('periodo_id', periodoData.id);

  const egresosLiquidaciones = liquidaciones?.reduce((sum, l) => sum + (l.monto_neto || 0), 0) || 0;

  const totalEgresos = egresosGastos + egresosLiquidaciones;
  const utilidad = ingresos - totalEgresos;
  const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;

  // Get traslados stats
  const { data: traslados } = await supabase
    .from('traslados_mensuales')
    .select('cantidad_traslados')
    .eq('periodo_id', periodoData.id);

  const totalTraslados = traslados?.reduce((sum, t) => sum + (t.cantidad_traslados || 0), 0) || 0;

  return successResponse({
    periodo: {
      periodo: periodo,
      mes: mes,
      anio: anio,
    },
    ingresos: {
      total: redondear(ingresos),
      por_traslado: totalTraslados > 0 ? redondear(ingresos / totalTraslados) : 0,
    },
    egresos: {
      total: redondear(totalEgresos),
      gastos_operativos: redondear(egresosGastos),
      liquidaciones: redondear(egresosLiquidaciones),
      por_traslado: totalTraslados > 0 ? redondear(totalEgresos / totalTraslados) : 0,
    },
    rentabilidad: {
      utilidad: redondear(utilidad),
      margen_porcentaje: redondear(margen),
      utilidad_por_traslado: totalTraslados > 0 ? redondear(utilidad / totalTraslados) : 0,
    },
    estadisticas: {
      total_traslados: totalTraslados,
      total_facturas: facturas?.length || 0,
      total_gastos: gastos?.length || 0,
      total_liquidaciones: liquidaciones?.length || 0,
    },
  });
}

/**
 * Driver performance report
 */
async function reporteConductoresRendimiento(supabase: any, pathParts: string[], reportIndex: number) {
  const mes = parseInt(pathParts[reportIndex + 1]);
  const anio = parseInt(pathParts[reportIndex + 2]);

  if (!mes || !anio || !validatePeriodo(mes, anio)) {
    return errorResponse('Mes y año no válidos', 400);
  }

  const periodo = getPeriodo(mes, anio);

  // Get periodo_facturacion
  const { data: periodoData, error: periodoError } = await supabase
    .from('periodos_facturacion')
    .select('*')
    .eq('periodo', periodo)
    .single();

  if (periodoError) {
    return errorResponse('Periodo no encontrado', 404, periodoError);
  }

  // Get all conductores
  const { data: conductores, error: conductoresError } = await supabase
    .from('conductores')
    .select('*')
    .eq('activo', true)
    .order('apellido');

  if (conductoresError) {
    return errorResponse('Error al obtener conductores', 500, conductoresError);
  }

  const rendimientos = [];
  const { inicio, fin } = {
    inicio: periodoData.fecha_inicio,
    fin: periodoData.fecha_fin,
  };

  for (const conductor of conductores || []) {
    // Count traslados
    const { data: traslados } = await supabase
      .from('horarios_traslados')
      .select('id, distancia_km, estado')
      .eq('conductor_id', conductor.id)
      .gte('fecha', inicio)
      .lte('fecha', fin);

    const totalTraslados = traslados?.length || 0;
    const trasladosCompletados = traslados?.filter(t => t.estado === 'completado').length || 0;
    const trasladosCancelados = traslados?.filter(t => t.estado === 'cancelado').length || 0;
    const distanciaTotal = traslados?.reduce((sum, t) => sum + (t.distancia_km || 0), 0) || 0;

    // Get liquidacion
    const { data: liquidacion } = await supabase
      .from('liquidaciones_conductores')
      .select('monto_neto, cantidad_traslados')
      .eq('conductor_id', conductor.id)
      .eq('periodo_id', periodoData.id)
      .single();

    // Get gastos
    const { data: gastos } = await supabase
      .from('gastos_operativos')
      .select('monto')
      .eq('conductor_id', conductor.id)
      .eq('periodo_id', periodoData.id);

    const totalGastos = gastos?.reduce((sum, g) => sum + (g.monto || 0), 0) || 0;

    rendimientos.push({
      conductor: {
        id: conductor.id,
        nombre: conductor.nombre,
        apellido: conductor.apellido,
        dni: conductor.dni,
      },
      traslados: {
        total: totalTraslados,
        completados: trasladosCompletados,
        cancelados: trasladosCancelados,
        tasa_completados: totalTraslados > 0 
          ? redondear((trasladosCompletados / totalTraslados) * 100) 
          : 0,
      },
      distancia: {
        total_km: redondear(distanciaTotal),
        promedio_km: trasladosCompletados > 0 
          ? redondear(distanciaTotal / trasladosCompletados) 
          : 0,
      },
      financiero: {
        liquidacion: redondear(liquidacion?.monto_neto || 0),
        gastos: redondear(totalGastos),
        ingreso_por_traslado: trasladosCompletados > 0 
          ? redondear((liquidacion?.monto_neto || 0) / trasladosCompletados) 
          : 0,
      },
    });
  }

  // Sort by total traslados
  rendimientos.sort((a, b) => b.traslados.total - a.traslados.total);

  return successResponse({
    periodo: {
      periodo: periodo,
      mes: mes,
      anio: anio,
    },
    resumen: {
      total_conductores: rendimientos.length,
      total_traslados: rendimientos.reduce((sum, r) => sum + r.traslados.total, 0),
      total_completados: rendimientos.reduce((sum, r) => sum + r.traslados.completados, 0),
      distancia_total: redondear(rendimientos.reduce((sum, r) => sum + r.distancia.total_km, 0)),
    },
    por_conductor: rendimientos,
  });
}
