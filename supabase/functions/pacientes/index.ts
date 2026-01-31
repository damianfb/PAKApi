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
    const id = pathParts[pathParts.length - 2] === 'pacientes' ? pathParts[pathParts.length - 1] : null;
    const isServiciosEndpoint = pathParts.includes('servicios');

    // GET /pacientes/:id/servicios - Get all services for a patient
    if (req.method === 'GET' && id && isServiciosEndpoint) {
      const activo = url.searchParams.get('activo');

      let query = supabase
        .from('servicios_paciente')
        .select('*, obra_social:obras_sociales(*), destino:destinos(*)')
        .eq('paciente_id', id)
        .order('created_at', { ascending: false });

      if (activo !== null) {
        query = query.eq('activo', activo === 'true');
      }

      const { data, error } = await query;

      if (error) {
        return errorResponse('Error al obtener servicios del paciente', 500, error);
      }

      return successResponse(data);
    }

    // GET single paciente by ID
    if (req.method === 'GET' && id && id !== 'pacientes') {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*, obra_social:obras_sociales(*)')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Paciente no encontrado', 404, error);
      }

      return successResponse(data);
    }

    // GET all pacientes (with optional filters)
    if (req.method === 'GET') {
      const activo = url.searchParams.get('activo');
      const dni = url.searchParams.get('dni');
      const obra_social_id = url.searchParams.get('obra_social_id');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('pacientes')
        .select('*, obra_social:obras_sociales(*)', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('apellido', { ascending: true });

      if (activo !== null) {
        query = query.eq('activo', activo === 'true');
      }

      if (dni) {
        query = query.eq('dni', dni);
      }

      if (obra_social_id) {
        query = query.eq('obra_social_id', obra_social_id);
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener pacientes', 500, error);
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

    // POST create new paciente
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.nombre || !body.apellido || !body.dni) {
        return errorResponse('Los campos "nombre", "apellido" y "dni" son requeridos', 400);
      }

      const { data, error } = await supabase
        .from('pacientes')
        .insert([
          {
            nombre: body.nombre,
            apellido: body.apellido,
            dni: body.dni,
            fecha_nacimiento: body.fecha_nacimiento || null,
            telefono: body.telefono || null,
            email: body.email || null,
            direccion: body.direccion || null,
            ciudad: body.ciudad || null,
            provincia: body.provincia || null,
            codigo_postal: body.codigo_postal || null,
            obra_social_id: body.obra_social_id || null,
            numero_afiliado: body.numero_afiliado || null,
            activo: body.activo !== undefined ? body.activo : true,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear paciente', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update paciente by ID
    if (req.method === 'PUT' && id && id !== 'pacientes') {
      const body = await req.json();

      const { data, error } = await supabase
        .from('pacientes')
        .update({
          nombre: body.nombre,
          apellido: body.apellido,
          dni: body.dni,
          fecha_nacimiento: body.fecha_nacimiento,
          telefono: body.telefono,
          email: body.email,
          direccion: body.direccion,
          ciudad: body.ciudad,
          provincia: body.provincia,
          codigo_postal: body.codigo_postal,
          obra_social_id: body.obra_social_id,
          numero_afiliado: body.numero_afiliado,
          activo: body.activo,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar paciente', 400, error);
      }

      return successResponse(data);
    }

    // DELETE paciente by ID (soft delete)
    if (req.method === 'DELETE' && id && id !== 'pacientes') {
      const { data, error } = await supabase
        .from('pacientes')
        .update({ activo: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al eliminar paciente', 400, error);
      }

      return successResponse({ message: 'Paciente eliminado exitosamente', data });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
