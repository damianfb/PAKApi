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

    // GET cartera data directly from pacientes + servicios
    if (req.method === 'GET') {
      const obra_social_id = url.searchParams.get('obra_social_id');
      const tipo_dependencia = url.searchParams.get('tipo_dependencia');
      const activo = url.searchParams.get('activo');
      const search = url.searchParams.get('search');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      // Query pacientes with their services directly
      let query = supabase
        .from('pacientes')
        .select(`
          id,
          apellido,
          nombre,
          dni,
          telefono,
          direccion,
          ciudad,
          numero_afiliado,
          activo,
          obra_social:obras_sociales(id, nombre, codigo),
          servicios:servicios_paciente(
            id,
            tipo_servicio,
            dias_semana,
            cantidad_mensual,
            activo,
            destino:destinos(id, nombre, direccion)
          )
        `, { count: 'exact' });

      if (obra_social_id) {
        query = query.eq('obra_social_id', obra_social_id);
      }

      if (tipo_dependencia && tipo_dependencia !== 'todos') {
        // Filter will be applied post-query since tipo_dependencia might not exist yet
      }

      if (activo !== null && activo !== 'todos') {
        query = query.eq('activo', activo === 'true' || activo === 'activo');
      } else {
        // Default to active patients
        query = query.eq('activo', true);
      }

      if (search) {
        query = query.or(`apellido.ilike.%${search}%,nombre.ilike.%${search}%,dni.ilike.%${search}%`);
      }

      query = query
        .range(offset, offset + limit - 1)
        .order('apellido', { ascending: true })
        .order('nombre', { ascending: true });

      const { data, error, count } = await query;

      if (error) {
        console.error('Query error:', error);
        return errorResponse('Error al obtener cartera', 500, error);
      }

      // Transform data to match expected cartera format
      const transformedData = (data || []).map((p: any) => {
        const servicios = (p.servicios || []).filter((s: any) => s.activo);
        // Default values - will use tipo_dependencia when available
        const valorKmDefault = 833.79; // Default to con dependencia

        return {
          paciente_id: p.id,
          apellido: p.apellido,
          nombre: p.nombre,
          dni: p.dni,
          telefono: p.telefono,
          direccion_particular: p.direccion,
          localidad: p.ciudad,
          numero_afiliado: p.numero_afiliado,
          tipo_dependencia: 'C/DEPEN',
          activo: p.activo,
          obra_social_id: p.obra_social?.id,
          obra_social_nombre: p.obra_social?.nombre,
          obra_social_codigo: p.obra_social?.codigo,
          servicios: servicios.map((s: any) => ({
            id: s.id,
            tipo_servicio: s.tipo_servicio,
            destino_nombre: s.destino?.nombre,
            destino_direccion: s.destino?.direccion,
            dias_semana: s.dias_semana,
            cantidad_mensual: s.cantidad_mensual || 22,
            kilometros_diarios: 0,
            valor_por_km: valorKmDefault,
            monto_mensual_estimado: 0,
            activo: s.activo,
          })),
          total_km_mes: 0,
          total_monto_mensual: 0,
          valor_km_default: valorKmDefault,
        };
      });

      return successResponse({
        data: transformedData,
        totals: {
          total_pacientes: count || 0,
          total_km_mes: 0,
          total_monto_mensual: 0,
        },
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    return errorResponse('Método no permitido', 405);
  } catch (err) {
    console.error('Cartera error:', err);
    return errorResponse('Error interno del servidor', 500, err);
  }
});