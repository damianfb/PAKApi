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
    const id = pathParts[pathParts.length - 1];

    // GET single servicio_paciente by ID
    if (req.method === 'GET' && id && id !== 'servicios-paciente') {
      const { data, error } = await supabase
        .from('servicios_paciente')
        .select('*, paciente:pacientes(*), obra_social:obras_sociales(*), destino:destinos(*)')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Servicio no encontrado', 404, error);
      }

      return successResponse(data);
    }

    // GET all servicios_paciente (with optional filters)
    if (req.method === 'GET') {
      const activo = url.searchParams.get('activo');
      const paciente_id = url.searchParams.get('paciente_id');
      const tipo_servicio = url.searchParams.get('tipo_servicio');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('servicios_paciente')
        .select('*, paciente:pacientes(*), obra_social:obras_sociales(*), destino:destinos(*)', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (activo !== null) {
        query = query.eq('activo', activo === 'true');
      }

      if (paciente_id) {
        query = query.eq('paciente_id', paciente_id);
      }

      if (tipo_servicio) {
        query = query.eq('tipo_servicio', tipo_servicio);
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener servicios', 500, error);
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

    // POST create new servicio_paciente
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.paciente_id || !body.tipo_servicio || !body.fecha_inicio) {
        return errorResponse('Los campos "paciente_id", "tipo_servicio" y "fecha_inicio" son requeridos', 400);
      }

      const { data, error } = await supabase
        .from('servicios_paciente')
        .insert([
          {
            paciente_id: body.paciente_id,
            obra_social_id: body.obra_social_id || null,
            destino_id: body.destino_id || null,
            tipo_servicio: body.tipo_servicio,
            frecuencia: body.frecuencia || null,
            dias_semana: body.dias_semana || null,
            cantidad_mensual: body.cantidad_mensual || 0,
            kilometros_diarios: body.kilometros_diarios || 0,
            hora_ida: body.hora_ida || null,
            hora_vuelta: body.hora_vuelta || null,
            numero_autorizacion: body.numero_autorizacion || null,
            valor_por_km: body.valor_por_km || null,
            monto_mensual_estimado: body.monto_mensual_estimado || 0,
            observaciones: body.observaciones || null,
            fecha_inicio: body.fecha_inicio,
            fecha_fin: body.fecha_fin || null,
            activo: body.activo !== undefined ? body.activo : true,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear servicio', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update servicio_paciente by ID
    if (req.method === 'PUT' && id && id !== 'servicios-paciente') {
      const body = await req.json();

      const { data, error } = await supabase
        .from('servicios_paciente')
        .update({
          paciente_id: body.paciente_id,
          obra_social_id: body.obra_social_id,
          destino_id: body.destino_id,
          tipo_servicio: body.tipo_servicio,
          frecuencia: body.frecuencia,
          dias_semana: body.dias_semana,
          cantidad_mensual: body.cantidad_mensual,
          kilometros_diarios: body.kilometros_diarios,
          hora_ida: body.hora_ida,
          hora_vuelta: body.hora_vuelta,
          numero_autorizacion: body.numero_autorizacion,
          valor_por_km: body.valor_por_km,
          monto_mensual_estimado: body.monto_mensual_estimado,
          observaciones: body.observaciones,
          fecha_inicio: body.fecha_inicio,
          fecha_fin: body.fecha_fin,
          activo: body.activo,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar servicio', 400, error);
      }

      return successResponse(data);
    }

    // DELETE servicio_paciente by ID (soft delete)
    if (req.method === 'DELETE' && id && id !== 'servicios-paciente') {
      const { data, error } = await supabase
        .from('servicios_paciente')
        .update({ activo: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al eliminar servicio', 400, error);
      }

      return successResponse({ message: 'Servicio eliminado exitosamente', data });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
