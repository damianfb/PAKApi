import { createSupabaseClient } from '../_shared/supabase.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getPeriodo, validatePeriodo, generateNumero, redondear, calcularPorcentaje } from '../_shared/utils.ts';

/**
 * POST /facturas/generar
 * Generates invoices automatically for a billing period
 * 
 * Request body:
 * {
 *   "mes": 1,        // Month (1-12)
 *   "anio": 2026     // Year
 * }
 * 
 * Business logic:
 * - Finds periodo_facturacion for the given month/year
 * - Groups traslados_mensuales by obra_social_id
 * - Creates one factura per obra_social with corresponding facturas_detalle
 * - Calculates subtotal, taxes (21% IVA), and total
 * - Generates sequential invoice numbers
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

    // Step 1: Find periodo_facturacion
    const { data: periodoData, error: periodoError } = await supabase
      .from('periodos_facturacion')
      .select('*')
      .eq('periodo', periodo)
      .single();

    if (periodoError) {
      return errorResponse('Periodo de facturación no encontrado. Debe generar traslados primero.', 404, periodoError);
    }

    // Step 2: Get traslados_mensuales for this period with obra_social details
    const { data: traslados, error: trasladosError } = await supabase
      .from('traslados_mensuales')
      .select(`
        *,
        paciente:pacientes(id, nombre, apellido, dni),
        obra_social:obras_sociales(id, nombre, codigo)
      `)
      .eq('periodo_id', periodoData.id)
      .not('obra_social_id', 'is', null)
      .gt('monto_obra_social', 0)
      .order('obra_social_id');

    if (trasladosError) {
      return errorResponse('Error al obtener traslados mensuales', 500, trasladosError);
    }

    if (!traslados || traslados.length === 0) {
      return errorResponse('No hay traslados para facturar en este periodo', 400);
    }

    // Step 3: Group traslados by obra_social_id
    const trasladosPorOS = new Map();
    for (const traslado of traslados) {
      const osId = traslado.obra_social_id;
      if (!trasladosPorOS.has(osId)) {
        trasladosPorOS.set(osId, []);
      }
      trasladosPorOS.get(osId).push(traslado);
    }

    // Step 4: Get next invoice sequence number for the year
    const { data: lastInvoice } = await supabase
      .from('facturas')
      .select('numero_factura')
      .like('numero_factura', `FAC-${anio}-%`)
      .order('numero_factura', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastInvoice) {
      const parts = lastInvoice.numero_factura.split('-');
      sequence = parseInt(parts[2]) + 1;
    }

    // Step 5: Create invoices
    const facturasCreadas = [];
    const today = new Date().toISOString().split('T')[0];
    const vencimiento = new Date();
    vencimiento.setDate(vencimiento.getDate() + 30); // 30 days payment term
    const fechaVencimiento = vencimiento.toISOString().split('T')[0];

    for (const [obrasocialId, trasladosOS] of trasladosPorOS) {
      const obraSocial = trasladosOS[0].obra_social;

      // Calculate subtotal from monto_obra_social
      const subtotal = trasladosOS.reduce((sum, t) => sum + (t.monto_obra_social || 0), 0);
      
      // Calculate tax (21% IVA)
      const impuestos = calcularPorcentaje(subtotal, 21);
      const montoTotal = redondear(subtotal + impuestos);

      // Generate invoice number
      const numeroFactura = generateNumero('FAC', anio, sequence++);

      // Create factura
      const { data: factura, error: facturaError } = await supabase
        .from('facturas')
        .insert({
          numero_factura: numeroFactura,
          fecha_emision: today,
          fecha_vencimiento: fechaVencimiento,
          periodo_id: periodoData.id,
          obra_social_id: obrasocialId,
          subtotal: redondear(subtotal),
          impuestos: redondear(impuestos),
          monto_total: montoTotal,
          estado: 'emitida',
          observaciones: `Factura generada automáticamente para periodo ${periodo}`,
        })
        .select()
        .single();

      if (facturaError) {
        console.error('Error creating factura:', facturaError);
        continue;
      }

      // Create facturas_detalle for each traslado
      const detalles = trasladosOS.map(traslado => ({
        factura_id: factura.id,
        traslado_mensual_id: traslado.id,
        paciente_id: traslado.paciente_id,
        descripcion: `Traslados ${traslado.paciente.nombre} ${traslado.paciente.apellido} (DNI: ${traslado.paciente.dni})`,
        cantidad: traslado.cantidad_traslados || 0,
        precio_unitario: traslado.cantidad_traslados > 0 
          ? redondear(traslado.monto_obra_social / traslado.cantidad_traslados) 
          : 0,
        subtotal: redondear(traslado.monto_obra_social),
        observaciones: `${traslado.cantidad_autorizada} traslados autorizados, ${traslado.cantidad_excedida || 0} excedidos`,
      }));

      const { error: detallesError } = await supabase
        .from('facturas_detalle')
        .insert(detalles);

      if (detallesError) {
        console.error('Error creating facturas_detalle:', detallesError);
        // Continue even if details fail - invoice is created
      }

      facturasCreadas.push({
        factura,
        obra_social: obraSocial,
        cantidad_pacientes: trasladosOS.length,
        cantidad_traslados: trasladosOS.reduce((sum, t) => sum + (t.cantidad_traslados || 0), 0),
      });
    }

    return successResponse({
      periodo: periodoData,
      resultados: {
        total: facturasCreadas.length,
        facturas: facturasCreadas,
      },
    });

  } catch (error) {
    console.error('Error generando facturas:', error);
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
