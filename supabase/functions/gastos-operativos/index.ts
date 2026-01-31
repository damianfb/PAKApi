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
    const id = pathParts[pathParts.length - 1] !== 'gastos-operativos' ? pathParts[pathParts.length - 1] : null;

    // GET single gasto by ID
    if (req.method === 'GET' && id) {
      const { data, error } = await supabase
        .from('gastos_operativos')
        .select('*, conductor:conductores(*), periodo:periodos_facturacion(*)')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Gasto operativo no encontrado', 404, error);
      }

      return successResponse(data);
    }

    // GET all gastos_operativos (with optional filters)
    if (req.method === 'GET') {
      const conductor_id = url.searchParams.get('conductor_id');
      const periodo_id = url.searchParams.get('periodo_id');
      const tipo_gasto = url.searchParams.get('tipo_gasto');
      const estado = url.searchParams.get('estado');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('gastos_operativos')
        .select('*, conductor:conductores(*), periodo:periodos_facturacion(*)', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('fecha', { ascending: false });

      if (conductor_id) {
        query = query.eq('conductor_id', conductor_id);
      }

      if (periodo_id) {
        query = query.eq('periodo_id', periodo_id);
      }

      if (tipo_gasto) {
        query = query.eq('tipo_gasto', tipo_gasto);
      }

      if (estado) {
        query = query.eq('estado', estado);
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener gastos operativos', 500, error);
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

    // POST create new gasto_operativo
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.numero_gasto || !body.fecha || !body.tipo_gasto || body.monto === undefined) {
        return errorResponse('Los campos "numero_gasto", "fecha", "tipo_gasto" y "monto" son requeridos', 400);
      }

      const { data, error } = await supabase
        .from('gastos_operativos')
        .insert([
          {
            numero_gasto: body.numero_gasto,
            fecha: body.fecha,
            tipo_gasto: body.tipo_gasto,
            monto: body.monto,
            conductor_id: body.conductor_id || null,
            periodo_id: body.periodo_id || null,
            descripcion: body.descripcion || null,
            comprobante: body.comprobante || null,
            proveedor: body.proveedor || null,
            estado: body.estado || 'registrado',
            fecha_pago: body.fecha_pago || null,
            observaciones: body.observaciones || null,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear gasto operativo', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update gasto_operativo by ID
    if (req.method === 'PUT' && id) {
      const body = await req.json();

      const { data, error } = await supabase
        .from('gastos_operativos')
        .update({
          fecha: body.fecha,
          tipo_gasto: body.tipo_gasto,
          monto: body.monto,
          conductor_id: body.conductor_id,
          periodo_id: body.periodo_id,
          descripcion: body.descripcion,
          comprobante: body.comprobante,
          proveedor: body.proveedor,
          estado: body.estado,
          fecha_pago: body.fecha_pago,
          observaciones: body.observaciones,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar gasto operativo', 400, error);
      }

      return successResponse(data);
    }

    // DELETE gasto_operativo by ID (soft delete by setting estado to 'anulado')
    if (req.method === 'DELETE' && id) {
      const { data, error } = await supabase
        .from('gastos_operativos')
        .update({ estado: 'anulado' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al anular gasto operativo', 400, error);
      }

      return successResponse({ message: 'Gasto operativo anulado exitosamente', data });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
