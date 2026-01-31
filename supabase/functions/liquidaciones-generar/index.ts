import { createSupabaseClient } from '../_shared/supabase.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getPeriodo, getMonthRange, validatePeriodo, generateNumero, redondear } from '../_shared/utils.ts';

/**
 * POST /liquidaciones/generar
 * Generates driver settlements/liquidations for a billing period
 * 
 * Request body:
 * {
 *   "mes": 1,        // Month (1-12)
 *   "anio": 2026     // Year
 * }
 * 
 * Business logic:
 * - Finds periodo_facturacion for the given month/year
 * - For each conductor with horarios_traslados in the period:
 *   - Counts completed transports
 *   - Calculates transport amounts (base rate per transport)
 *   - Sums operational expenses (gastos_operativos) for the conductor
 *   - Calculates net amount (transports - expenses)
 *   - Creates liquidacion_conductor record
 */
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse('Método no permitido', 405);
  }

  try {
    const supabase = createSupabaseClient(req);
    const body = await req.json();
    
    // Validate input
    const { mes, anio } = body;
    
    if (!mes || !anio) {
      return errorResponse('Se requieren mes y anio', 400);
    }

    if (!validatePeriodo(mes, anio)) {
      return errorResponse('Mes debe ser entre 1-12 y año entre 2000-2100', 400);
    }

    const periodo = getPeriodo(mes, anio);
    const { inicio, fin } = getMonthRange(mes, anio);

    // Step 1: Find periodo_facturacion
    const { data: periodoData, error: periodoError } = await supabase
      .from('periodos_facturacion')
      .select('*')
      .eq('periodo', periodo)
      .single();

    if (periodoError) {
      return errorResponse('Periodo de facturación no encontrado', 404, periodoError);
    }

    // Step 2: Get all active conductores
    const { data: conductores, error: conductoresError } = await supabase
      .from('conductores')
      .select('*')
      .eq('activo', true)
      .order('apellido');

    if (conductoresError) {
      return errorResponse('Error al obtener conductores', 500, conductoresError);
    }

    if (!conductores || conductores.length === 0) {
      return errorResponse('No hay conductores activos', 400);
    }

    // Step 3: Get next liquidation sequence number for the year
    const { data: lastLiquidacion } = await supabase
      .from('liquidaciones_conductores')
      .select('numero_liquidacion')
      .like('numero_liquidacion', `LIQ-${anio}-%`)
      .order('numero_liquidacion', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastLiquidacion) {
      const parts = lastLiquidacion.numero_liquidacion.split('-');
      sequence = parseInt(parts[2]) + 1;
    }

    // Step 4: Process each conductor
    const liquidacionesCreadas = [];
    const today = new Date().toISOString().split('T')[0];
    const tarifaPorTraslado = 300; // Example: $300 per transport for driver

    for (const conductor of conductores) {
      // Count completed transports for this conductor in the period
      const { data: traslados, error: trasladosError } = await supabase
        .from('horarios_traslados')
        .select('id, distancia_km')
        .eq('conductor_id', conductor.id)
        .gte('fecha', inicio)
        .lte('fecha', fin)
        .in('estado', ['completado', 'confirmado']);

      if (trasladosError) {
        console.error('Error getting traslados for conductor:', conductor.id, trasladosError);
        continue;
      }

      const cantidadTraslados = traslados?.length || 0;
      
      // Skip conductor if no transports
      if (cantidadTraslados === 0) {
        continue;
      }

      // Calculate transport amount
      const montoTraslados = redondear(cantidadTraslados * tarifaPorTraslado);

      // Sum operational expenses for this conductor in the period
      const { data: gastos, error: gastosError } = await supabase
        .from('gastos_operativos')
        .select('monto')
        .eq('conductor_id', conductor.id)
        .eq('periodo_id', periodoData.id)
        .in('estado', ['aprobado', 'pagado']);

      if (gastosError) {
        console.error('Error getting gastos for conductor:', conductor.id, gastosError);
      }

      const montoGastos = gastos?.reduce((sum, g) => sum + (g.monto || 0), 0) || 0;

      // Calculate bonuses (example: 10% bonus if more than 100 transports)
      const montoBonificaciones = cantidadTraslados >= 100 
        ? redondear(montoTraslados * 0.10) 
        : 0;

      // No additional deductions in this example
      const montoDeducciones = 0;

      // Calculate net amount
      const montoNeto = redondear(montoTraslados - montoGastos + montoBonificaciones - montoDeducciones);

      // Skip if net amount is zero or negative
      if (montoNeto <= 0) {
        continue;
      }

      // Generate liquidation number
      const numeroLiquidacion = generateNumero('LIQ', anio, sequence++);

      // Check if liquidation already exists for this conductor and period
      const { data: existingLiq } = await supabase
        .from('liquidaciones_conductores')
        .select('id')
        .eq('conductor_id', conductor.id)
        .eq('periodo_id', periodoData.id)
        .single();

      if (existingLiq) {
        // Skip if already exists
        continue;
      }

      // Create liquidacion
      const { data: liquidacion, error: liquidacionError } = await supabase
        .from('liquidaciones_conductores')
        .insert({
          numero_liquidacion: numeroLiquidacion,
          conductor_id: conductor.id,
          periodo_id: periodoData.id,
          fecha_generacion: today,
          cantidad_traslados: cantidadTraslados,
          monto_traslados: montoTraslados,
          monto_gastos: redondear(montoGastos),
          monto_bonificaciones: montoBonificaciones,
          monto_deducciones: montoDeducciones,
          monto_neto: montoNeto,
          estado: 'pendiente',
          observaciones: `Liquidación generada automáticamente para periodo ${periodo}`,
        })
        .select()
        .single();

      if (liquidacionError) {
        console.error('Error creating liquidacion:', liquidacionError);
        continue;
      }

      liquidacionesCreadas.push({
        liquidacion,
        conductor: {
          id: conductor.id,
          nombre: conductor.nombre,
          apellido: conductor.apellido,
          dni: conductor.dni,
        },
      });
    }

    return successResponse({
      periodo: periodoData,
      resultados: {
        total: liquidacionesCreadas.length,
        liquidaciones: liquidacionesCreadas,
      },
    });

  } catch (error) {
    console.error('Error generando liquidaciones:', error);
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
