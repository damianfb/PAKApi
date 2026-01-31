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

    // GET single obra social by ID
    if (req.method === 'GET' && id && id !== 'obras-sociales') {
      const { data, error } = await supabase
        .from('obras_sociales')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Obra social no encontrada', 404, error);
      }

      return successResponse(data);
    }

    // GET all obras sociales (with optional filters)
    if (req.method === 'GET') {
      const activo = url.searchParams.get('activo');
      const codigo = url.searchParams.get('codigo');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('obras_sociales')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('nombre', { ascending: true });

      if (activo !== null) {
        query = query.eq('activo', activo === 'true');
      }

      if (codigo) {
        query = query.eq('codigo', codigo);
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener obras sociales', 500, error);
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

    // POST create new obra social
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.nombre) {
        return errorResponse('El campo "nombre" es requerido', 400);
      }

      const { data, error } = await supabase
        .from('obras_sociales')
        .insert([
          {
            nombre: body.nombre,
            codigo: body.codigo || null,
            telefono: body.telefono || null,
            email: body.email || null,
            direccion: body.direccion || null,
            activo: body.activo !== undefined ? body.activo : true,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear obra social', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update obra social by ID
    if (req.method === 'PUT' && id && id !== 'obras-sociales') {
      const body = await req.json();

      const { data, error } = await supabase
        .from('obras_sociales')
        .update({
          nombre: body.nombre,
          codigo: body.codigo,
          telefono: body.telefono,
          email: body.email,
          direccion: body.direccion,
          activo: body.activo,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar obra social', 400, error);
      }

      return successResponse(data);
    }

    // DELETE obra social by ID (soft delete)
    if (req.method === 'DELETE' && id && id !== 'obras-sociales') {
      const { data, error } = await supabase
        .from('obras_sociales')
        .update({ activo: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al eliminar obra social', 400, error);
      }

      return successResponse({ message: 'Obra social eliminada exitosamente', data });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
