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
    const id = pathParts[pathParts.length - 1] !== 'recibos' ? pathParts[pathParts.length - 1] : null;

    // GET single recibo by ID
    if (req.method === 'GET' && id) {
      const { data, error } = await supabase
        .from('recibos')
        .select('*, cobranza:cobranzas(*), obra_social:obras_sociales(*), detalles:recibos_detalle(*)')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Recibo no encontrado', 404, error);
      }

      return successResponse(data);
    }

    // GET all recibos (with optional filters)
    if (req.method === 'GET') {
      const cobranza_id = url.searchParams.get('cobranza_id');
      const obra_social_id = url.searchParams.get('obra_social_id');
      const estado = url.searchParams.get('estado');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('recibos')
        .select('*, cobranza:cobranzas(*), obra_social:obras_sociales(*)', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('fecha_pago', { ascending: false });

      if (cobranza_id) {
        query = query.eq('cobranza_id', cobranza_id);
      }

      if (obra_social_id) {
        query = query.eq('obra_social_id', obra_social_id);
      }

      if (estado) {
        query = query.eq('estado', estado);
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener recibos', 500, error);
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

    // POST create new recibo
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.numero_recibo || !body.fecha_pago || !body.cobranza_id) {
        return errorResponse('Los campos "numero_recibo", "fecha_pago" y "cobranza_id" son requeridos', 400);
      }

      const { data, error } = await supabase
        .from('recibos')
        .insert([
          {
            numero_recibo: body.numero_recibo,
            fecha_pago: body.fecha_pago,
            cobranza_id: body.cobranza_id,
            obra_social_id: body.obra_social_id || null,
            monto_total: body.monto_total || 0,
            metodo_pago: body.metodo_pago || null,
            numero_transaccion: body.numero_transaccion || null,
            comprobante_path: body.comprobante_path || null,
            estado: body.estado || 'registrado',
            observaciones: body.observaciones || null,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear recibo', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update recibo by ID
    if (req.method === 'PUT' && id) {
      const body = await req.json();

      const { data, error } = await supabase
        .from('recibos')
        .update({
          fecha_pago: body.fecha_pago,
          monto_total: body.monto_total,
          metodo_pago: body.metodo_pago,
          numero_transaccion: body.numero_transaccion,
          comprobante_path: body.comprobante_path,
          estado: body.estado,
          observaciones: body.observaciones,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar recibo', 400, error);
      }

      return successResponse(data);
    }

    // DELETE recibo by ID (soft delete by setting estado to 'anulado')
    if (req.method === 'DELETE' && id) {
      const { data, error } = await supabase
        .from('recibos')
        .update({ estado: 'anulado' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al anular recibo', 400, error);
      }

      return successResponse({ message: 'Recibo anulado exitosamente', data });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
