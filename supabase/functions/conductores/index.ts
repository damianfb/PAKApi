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

    // GET single conductor by ID
    if (req.method === 'GET' && id && id !== 'conductores') {
      const { data, error } = await supabase
        .from('conductores')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Conductor no encontrado', 404, error);
      }

      return successResponse(data);
    }

    // GET all conductores (with optional filters)
    if (req.method === 'GET') {
      const activo = url.searchParams.get('activo');
      const dni = url.searchParams.get('dni');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('conductores')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('apellido', { ascending: true });

      if (activo !== null) {
        query = query.eq('activo', activo === 'true');
      }

      if (dni) {
        query = query.eq('dni', dni);
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener conductores', 500, error);
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

    // POST create new conductor
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.nombre || !body.apellido || !body.dni) {
        return errorResponse('Los campos "nombre", "apellido" y "dni" son requeridos', 400);
      }

      const { data, error } = await supabase
        .from('conductores')
        .insert([
          {
            nombre: body.nombre,
            apellido: body.apellido,
            dni: body.dni,
            telefono: body.telefono || null,
            email: body.email || null,
            licencia_conducir: body.licencia_conducir || null,
            licencia_vencimiento: body.licencia_vencimiento || null,
            activo: body.activo !== undefined ? body.activo : true,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear conductor', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update conductor by ID
    if (req.method === 'PUT' && id && id !== 'conductores') {
      const body = await req.json();

      const { data, error } = await supabase
        .from('conductores')
        .update({
          nombre: body.nombre,
          apellido: body.apellido,
          dni: body.dni,
          telefono: body.telefono,
          email: body.email,
          licencia_conducir: body.licencia_conducir,
          licencia_vencimiento: body.licencia_vencimiento,
          activo: body.activo,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar conductor', 400, error);
      }

      return successResponse(data);
    }

    // DELETE conductor by ID (soft delete)
    if (req.method === 'DELETE' && id && id !== 'conductores') {
      const { data, error } = await supabase
        .from('conductores')
        .update({ activo: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al eliminar conductor', 400, error);
      }

      return successResponse({ message: 'Conductor eliminado exitosamente', data });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
