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
    const id = pathParts[pathParts.length - 1] !== 'horarios-traslados' ? pathParts[pathParts.length - 1] : null;

    // GET single horario by ID
    if (req.method === 'GET' && id) {
      const { data, error } = await supabase
        .from('horarios_traslados')
        .select('*, paciente:pacientes(*), servicio:servicios_paciente(*), conductor:conductores(*), destino:destinos(*)')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Horario de traslado no encontrado', 404, error);
      }

      return successResponse(data);
    }

    // GET all horarios_traslados (with optional filters)
    if (req.method === 'GET') {
      const paciente_id = url.searchParams.get('paciente_id');
      const conductor_id = url.searchParams.get('conductor_id');
      const estado = url.searchParams.get('estado');
      const fecha = url.searchParams.get('fecha');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('horarios_traslados')
        .select('*, paciente:pacientes(*), servicio:servicios_paciente(*), conductor:conductores(*), destino:destinos(*)', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('fecha', { ascending: false })
        .order('hora_programada', { ascending: false });

      if (paciente_id) {
        query = query.eq('paciente_id', paciente_id);
      }

      if (conductor_id) {
        query = query.eq('conductor_id', conductor_id);
      }

      if (estado) {
        query = query.eq('estado', estado);
      }

      if (fecha) {
        query = query.eq('fecha', fecha);
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener horarios de traslados', 500, error);
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

    // POST create new horario_traslado
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.paciente_id || !body.servicio_id || !body.fecha || !body.hora_programada) {
        return errorResponse('Los campos "paciente_id", "servicio_id", "fecha" y "hora_programada" son requeridos', 400);
      }

      const { data, error } = await supabase
        .from('horarios_traslados')
        .insert([
          {
            paciente_id: body.paciente_id,
            servicio_id: body.servicio_id,
            conductor_id: body.conductor_id || null,
            destino_id: body.destino_id || null,
            fecha: body.fecha,
            hora_programada: body.hora_programada,
            hora_real: body.hora_real || null,
            tipo_traslado: body.tipo_traslado || 'ida',
            direccion_origen: body.direccion_origen || null,
            direccion_destino: body.direccion_destino || null,
            distancia_km: body.distancia_km || null,
            estado: body.estado || 'programado',
            observaciones: body.observaciones || null,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear horario de traslado', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update horario_traslado by ID
    if (req.method === 'PUT' && id) {
      const body = await req.json();

      const { data, error } = await supabase
        .from('horarios_traslados')
        .update({
          conductor_id: body.conductor_id,
          destino_id: body.destino_id,
          fecha: body.fecha,
          hora_programada: body.hora_programada,
          hora_real: body.hora_real,
          tipo_traslado: body.tipo_traslado,
          direccion_origen: body.direccion_origen,
          direccion_destino: body.direccion_destino,
          distancia_km: body.distancia_km,
          estado: body.estado,
          observaciones: body.observaciones,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar horario de traslado', 400, error);
      }

      return successResponse(data);
    }

    // DELETE horario_traslado by ID (soft delete by setting estado to 'cancelado')
    if (req.method === 'DELETE' && id) {
      const { data, error } = await supabase
        .from('horarios_traslados')
        .update({ estado: 'cancelado' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al cancelar horario de traslado', 400, error);
      }

      return successResponse({ message: 'Horario de traslado cancelado exitosamente', data });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
