import { createSupabaseClient } from '../_shared/supabase.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getPeriodo, getMonthRange, validatePeriodo } from '../_shared/utils.ts';

/**
 * POST /traslados/generar-periodo
 * Generates traslados_mensuales for a billing period based on servicios_paciente
 * 
 * Request body:
 * {
 *   "mes": 1,        // Month (1-12)
 *   "anio": 2026     // Year
 * }
 * 
 * Business logic:
 * - Finds or creates periodo_facturacion for the given month/year
 * - For each active servicio_paciente:
 *   - Creates or updates traslados_mensuales record
 *   - Counts actual horarios_traslados in the period
 *   - Calculates authorized vs exceeded counts
 *   - Calculates billing amounts (obra_social + paciente portions)
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

    // Step 1: Find or create periodo_facturacion
    let { data: periodoData, error: periodoError } = await supabase
      .from('periodos_facturacion')
      .select('*')
      .eq('periodo', periodo)
      .single();

    if (periodoError && periodoError.code !== 'PGRST116') {
      return errorResponse('Error al buscar periodo de facturación', 500, periodoError);
    }

    // Create periodo if it doesn't exist
    if (!periodoData) {
      const { data: newPeriodo, error: createError } = await supabase
        .from('periodos_facturacion')
        .insert({
          periodo,
          fecha_inicio: inicio,
          fecha_fin: fin,
          estado: 'abierto',
        })
        .select()
        .single();

      if (createError) {
        return errorResponse('Error al crear periodo de facturación', 500, createError);
      }

      periodoData = newPeriodo;
    }

    // Step 2: Get all active servicios_paciente
    const { data: servicios, error: serviciosError } = await supabase
      .from('servicios_paciente')
      .select(`
        *,
        paciente:pacientes!inner(id, nombre, apellido),
        obra_social:obras_sociales(id, nombre)
      `)
      .eq('activo', true)
      .lte('fecha_inicio', fin)
      .or(`fecha_fin.is.null,fecha_fin.gte.${inicio}`)
      .order('paciente_id');

    if (serviciosError) {
      return errorResponse('Error al obtener servicios de pacientes', 500, serviciosError);
    }

    // Step 3: Process each servicio
    const resultados = [];
    let trasladosCreados = 0;
    let trasladosActualizados = 0;

    for (const servicio of servicios || []) {
      // Count actual horarios_traslados in the period
      const { count: cantidadTraslados, error: countError } = await supabase
        .from('horarios_traslados')
        .select('*', { count: 'exact', head: true })
        .eq('paciente_id', servicio.paciente_id)
        .eq('servicio_paciente_id', servicio.id)
        .gte('fecha', inicio)
        .lte('fecha', fin)
        .in('estado', ['completado', 'confirmado']);

      if (countError) {
        console.error('Error counting traslados:', countError);
        continue;
      }

      const cantidad = cantidadTraslados || 0;
      const cantidadAutorizada = servicio.cantidad_mensual || 0;
      const cantidadExcedida = Math.max(0, cantidad - cantidadAutorizada);

      // Calculate billing amounts (simplified logic)
      // In a real system, these would come from contract rates
      const precioUnitario = 500; // Example: $500 per transport
      const montoTotal = cantidad * precioUnitario;
      const montoObraSocial = cantidadAutorizada * precioUnitario;
      const montoPaciente = cantidadExcedida * precioUnitario;

      // Check if traslado_mensual already exists
      const { data: existingTraslado, error: existingError } = await supabase
        .from('traslados_mensuales')
        .select('id')
        .eq('paciente_id', servicio.paciente_id)
        .eq('periodo_id', periodoData.id)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Error checking existing traslado:', existingError);
        continue;
      }

      const trasladoData = {
        paciente_id: servicio.paciente_id,
        periodo_id: periodoData.id,
        servicio_paciente_id: servicio.id,
        obra_social_id: servicio.obra_social_id,
        cantidad_traslados: cantidad,
        cantidad_autorizada: cantidadAutorizada,
        cantidad_excedida: cantidadExcedida,
        monto_total: montoTotal,
        monto_obra_social: montoObraSocial,
        monto_paciente: montoPaciente,
      };

      if (existingTraslado) {
        // Update existing record
        const { data: updated, error: updateError } = await supabase
          .from('traslados_mensuales')
          .update(trasladoData)
          .eq('id', existingTraslado.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating traslado:', updateError);
          continue;
        }

        trasladosActualizados++;
        resultados.push({
          accion: 'actualizado',
          traslado: updated,
        });
      } else {
        // Create new record
        const { data: created, error: createError } = await supabase
          .from('traslados_mensuales')
          .insert(trasladoData)
          .select()
          .single();

        if (createError) {
          console.error('Error creating traslado:', createError);
          continue;
        }

        trasladosCreados++;
        resultados.push({
          accion: 'creado',
          traslado: created,
        });
      }
    }

    return successResponse({
      periodo: periodoData,
      resultados: {
        total: resultados.length,
        creados: trasladosCreados,
        actualizados: trasladosActualizados,
      },
      detalles: resultados,
    });

  } catch (error) {
    console.error('Error generando traslados:', error);
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
