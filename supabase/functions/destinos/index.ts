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

    // GET single destino by ID
    if (req.method === 'GET' && id && id !== 'destinos') {
      const { data, error } = await supabase
        .from('destinos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Destino no encontrado', 404, error);
      }

      return successResponse(data);
    }

    // GET all destinos (with optional filters)
    if (req.method === 'GET') {
      const activo = url.searchParams.get('activo');
      const tipo = url.searchParams.get('tipo');
      const ciudad = url.searchParams.get('ciudad');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('destinos')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('nombre', { ascending: true });

      if (activo !== null) {
        query = query.eq('activo', activo === 'true');
      }

      if (tipo) {
        query = query.eq('tipo', tipo);
      }

      if (ciudad) {
        query = query.ilike('ciudad', `%${ciudad}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener destinos', 500, error);
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

    // POST create new destino
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.nombre || !body.direccion) {
        return errorResponse('Los campos "nombre" y "direccion" son requeridos', 400);
      }

      const { data, error } = await supabase
        .from('destinos')
        .insert([
          {
            nombre: body.nombre,
            direccion: body.direccion,
            ciudad: body.ciudad || null,
            provincia: body.provincia || null,
            codigo_postal: body.codigo_postal || null,
            telefono: body.telefono || null,
            tipo: body.tipo || null,
            coordenadas_lat: body.coordenadas_lat || null,
            coordenadas_lng: body.coordenadas_lng || null,
            activo: body.activo !== undefined ? body.activo : true,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear destino', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update destino by ID
    if (req.method === 'PUT' && id && id !== 'destinos') {
      const body = await req.json();

      const { data, error } = await supabase
        .from('destinos')
        .update({
          nombre: body.nombre,
          direccion: body.direccion,
          ciudad: body.ciudad,
          provincia: body.provincia,
          codigo_postal: body.codigo_postal,
          telefono: body.telefono,
          tipo: body.tipo,
          coordenadas_lat: body.coordenadas_lat,
          coordenadas_lng: body.coordenadas_lng,
          activo: body.activo,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar destino', 400, error);
      }

      return successResponse(data);
    }

    // DELETE destino by ID (soft delete)
    if (req.method === 'DELETE' && id && id !== 'destinos') {
      const { data, error } = await supabase
        .from('destinos')
        .update({ activo: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al eliminar destino', 400, error);
      }

      return successResponse({ message: 'Destino eliminado exitosamente', data });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
