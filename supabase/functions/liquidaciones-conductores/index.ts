import { createSupabaseClient } from '../_shared/supabase.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient(req);
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const id = pathParts[pathParts.length - 1] !== 'liquidaciones-conductores' ? pathParts[pathParts.length - 1] : null;

    // GET single liquidacion by ID
    if (req.method === 'GET' && id) {
      const { data, error } = await supabase
        .from('liquidaciones_conductores')
        .select('*, conductor:conductores(*), periodo:periodos_facturacion(*)')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Liquidación no encontrada', 404, error);
      }

      return successResponse(data);
    }

    // GET all liquidaciones (with optional filters)
    if (req.method === 'GET') {
      const conductor_id = url.searchParams.get('conductor_id');
      const periodo_id = url.searchParams.get('periodo_id');
      const estado = url.searchParams.get('estado');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('liquidaciones_conductores')
        .select('*, conductor:conductores(*), periodo:periodos_facturacion(*)', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('fecha_generacion', { ascending: false });

      if (conductor_id) {
        query = query.eq('conductor_id', conductor_id);
      }

      if (periodo_id) {
        query = query.eq('periodo_id', periodo_id);
      }

      if (estado) {
        query = query.eq('estado', estado);
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener liquidaciones', 500, error);
      }

      return successResponse({
        data,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    // POST create new liquidacion
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.numero_liquidacion || !body.conductor_id || !body.fecha_generacion) {
        return errorResponse('Los campos "numero_liquidacion", "conductor_id" y "fecha_generacion" son requeridos', 400);
      }

      const { data, error } = await supabase
        .from('liquidaciones_conductores')
        .insert([
          {
            numero_liquidacion: body.numero_liquidacion,
            conductor_id: body.conductor_id,
            periodo_id: body.periodo_id || null,
            fecha_generacion: body.fecha_generacion,
            fecha_pago: body.fecha_pago || null,
            cantidad_traslados: body.cantidad_traslados || 0,
            monto_traslados: body.monto_traslados || 0,
            monto_gastos: body.monto_gastos || 0,
            monto_bonificaciones: body.monto_bonificaciones || 0,
            monto_deducciones: body.monto_deducciones || 0,
            monto_neto: body.monto_neto || 0,
            metodo_pago: body.metodo_pago || null,
            numero_comprobante: body.numero_comprobante || null,
            estado: body.estado || 'pendiente',
            observaciones: body.observaciones || null,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear liquidación', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update liquidacion by ID
    if (req.method === 'PUT' && id) {
      const body = await req.json();

      const { data, error } = await supabase
        .from('liquidaciones_conductores')
        .update({
          fecha_pago: body.fecha_pago,
          cantidad_traslados: body.cantidad_traslados,
          monto_traslados: body.monto_traslados,
          monto_gastos: body.monto_gastos,
          monto_bonificaciones: body.monto_bonificaciones,
          monto_deducciones: body.monto_deducciones,
          monto_neto: body.monto_neto,
          metodo_pago: body.metodo_pago,
          numero_comprobante: body.numero_comprobante,
          estado: body.estado,
          observaciones: body.observaciones,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar liquidación', 400, error);
      }

      return successResponse(data);
    }

    // DELETE liquidacion by ID (soft delete by setting estado to 'anulada')
    if (req.method === 'DELETE' && id) {
      const { data, error } = await supabase
        .from('liquidaciones_conductores')
        .update({ estado: 'anulada' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al anular liquidación', 400, error);
      }

      return successResponse({ message: 'Liquidación anulada exitosamente', data });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
