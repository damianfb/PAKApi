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
    const id = pathParts[pathParts.length - 1] !== 'traslados-mensuales' ? pathParts[pathParts.length - 1] : null;

    // GET single traslado_mensual by ID
    if (req.method === 'GET' && id) {
      const { data, error } = await supabase
        .from('traslados_mensuales')
        .select('*, paciente:pacientes(*), periodo:periodos_facturacion(*), servicio:servicios_paciente(*)')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Traslado mensual no encontrado', 404, error);
      }

      return successResponse(data);
    }

    // GET all traslados_mensuales (with optional filters)
    if (req.method === 'GET') {
      const paciente_id = url.searchParams.get('paciente_id');
      const periodo_id = url.searchParams.get('periodo_id');
      const facturado = url.searchParams.get('facturado');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('traslados_mensuales')
        .select('*, paciente:pacientes(*), periodo:periodos_facturacion(*), servicio:servicios_paciente(*)', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (paciente_id) {
        query = query.eq('paciente_id', paciente_id);
      }

      if (periodo_id) {
        query = query.eq('periodo_id', periodo_id);
      }

      if (facturado !== null) {
        query = query.eq('facturado', facturado === 'true');
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener traslados mensuales', 500, error);
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

    // POST create new traslado_mensual
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.paciente_id || !body.periodo_id || !body.servicio_id) {
        return errorResponse('Los campos "paciente_id", "periodo_id" y "servicio_id" son requeridos', 400);
      }

      const { data, error } = await supabase
        .from('traslados_mensuales')
        .insert([
          {
            paciente_id: body.paciente_id,
            periodo_id: body.periodo_id,
            servicio_id: body.servicio_id,
            cantidad_autorizada: body.cantidad_autorizada || 0,
            cantidad_realizada: body.cantidad_realizada || 0,
            cantidad_excedida: body.cantidad_excedida || 0,
            monto_obra_social: body.monto_obra_social || 0,
            monto_paciente: body.monto_paciente || 0,
            monto_total: body.monto_total || 0,
            facturado: body.facturado !== undefined ? body.facturado : false,
            observaciones: body.observaciones || null,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear traslado mensual', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update traslado_mensual by ID
    if (req.method === 'PUT' && id) {
      const body = await req.json();

      const { data, error } = await supabase
        .from('traslados_mensuales')
        .update({
          cantidad_autorizada: body.cantidad_autorizada,
          cantidad_realizada: body.cantidad_realizada,
          cantidad_excedida: body.cantidad_excedida,
          monto_obra_social: body.monto_obra_social,
          monto_paciente: body.monto_paciente,
          monto_total: body.monto_total,
          facturado: body.facturado,
          observaciones: body.observaciones,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar traslado mensual', 400, error);
      }

      return successResponse(data);
    }

    // DELETE traslado_mensual by ID (hard delete in this case)
    if (req.method === 'DELETE' && id) {
      const { data, error } = await supabase
        .from('traslados_mensuales')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al eliminar traslado mensual', 400, error);
      }

      return successResponse({ message: 'Traslado mensual eliminado exitosamente', data });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
