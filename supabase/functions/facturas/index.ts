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
    const id = pathParts[pathParts.length - 1] !== 'facturas' ? pathParts[pathParts.length - 1] : null;

    // GET single factura by ID
    if (req.method === 'GET' && id) {
      const { data, error } = await supabase
        .from('facturas')
        .select('*, periodo:periodos_facturacion(*), obra_social:obras_sociales(*), detalles:facturas_detalle(*)')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Factura no encontrada', 404, error);
      }

      return successResponse(data);
    }

    // GET all facturas (with optional filters)
    if (req.method === 'GET') {
      const periodo_id = url.searchParams.get('periodo_id');
      const obra_social_id = url.searchParams.get('obra_social_id');
      const estado = url.searchParams.get('estado');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('facturas')
        .select('*, periodo:periodos_facturacion(*), obra_social:obras_sociales(*)', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('fecha_emision', { ascending: false });

      if (periodo_id) {
        query = query.eq('periodo_id', periodo_id);
      }

      if (obra_social_id) {
        query = query.eq('obra_social_id', obra_social_id);
      }

      if (estado) {
        query = query.eq('estado', estado);
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener facturas', 500, error);
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

    // POST create new factura
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.numero_factura || !body.fecha_emision || !body.periodo_id) {
        return errorResponse('Los campos "numero_factura", "fecha_emision" y "periodo_id" son requeridos', 400);
      }

      const { data, error } = await supabase
        .from('facturas')
        .insert([
          {
            numero_factura: body.numero_factura,
            fecha_emision: body.fecha_emision,
            fecha_vencimiento: body.fecha_vencimiento || null,
            periodo_id: body.periodo_id,
            obra_social_id: body.obra_social_id || null,
            subtotal: body.subtotal || 0,
            impuestos: body.impuestos || 0,
            monto_total: body.monto_total || 0,
            estado: body.estado || 'borrador',
            observaciones: body.observaciones || null,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear factura', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update factura by ID
    if (req.method === 'PUT' && id) {
      const body = await req.json();

      const { data, error } = await supabase
        .from('facturas')
        .update({
          numero_factura: body.numero_factura,
          fecha_emision: body.fecha_emision,
          fecha_vencimiento: body.fecha_vencimiento,
          obra_social_id: body.obra_social_id,
          subtotal: body.subtotal,
          impuestos: body.impuestos,
          monto_total: body.monto_total,
          estado: body.estado,
          fecha_pago: body.fecha_pago,
          observaciones: body.observaciones,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar factura', 400, error);
      }

      return successResponse(data);
    }

    // DELETE factura by ID (soft delete by setting estado to 'anulada')
    if (req.method === 'DELETE' && id) {
      const { data, error } = await supabase
        .from('facturas')
        .update({ estado: 'anulada' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al anular factura', 400, error);
      }

      return successResponse({ message: 'Factura anulada exitosamente', data });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
