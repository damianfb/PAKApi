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
    const id = pathParts[pathParts.length - 1] !== 'periodos-facturacion' ? pathParts[pathParts.length - 1] : null;

    // GET single periodo by ID
    if (req.method === 'GET' && id) {
      const { data, error } = await supabase
        .from('periodos_facturacion')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Período de facturación no encontrado', 404, error);
      }

      return successResponse(data);
    }

    // GET all periodos (with optional filters)
    if (req.method === 'GET') {
      const anio = url.searchParams.get('anio');
      const cerrado = url.searchParams.get('cerrado');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '24');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('periodos_facturacion')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('anio', { ascending: false })
        .order('mes', { ascending: false });

      if (anio) {
        query = query.eq('anio', parseInt(anio));
      }

      if (cerrado !== null && cerrado !== undefined) {
        query = query.eq('cerrado', cerrado === 'true');
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener períodos de facturación', 500, error);
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

    // POST create new periodo
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.mes || !body.anio) {
        return errorResponse('Los campos "mes" y "anio" son requeridos', 400);
      }

      // Verificar que no exista ya ese período
      const { data: existing } = await supabase
        .from('periodos_facturacion')
        .select('id')
        .eq('mes', body.mes)
        .eq('anio', body.anio)
        .single();

      if (existing) {
        return errorResponse('Ya existe un período de facturación para ese mes y año', 400);
      }

      // Calcular fechas de inicio y fin
      const fechaInicio = new Date(body.anio, body.mes - 1, 1);
      const fechaFin = new Date(body.anio, body.mes, 0); // Último día del mes

      const { data, error } = await supabase
        .from('periodos_facturacion')
        .insert([
          {
            mes: body.mes,
            anio: body.anio,
            fecha_inicio: fechaInicio.toISOString().split('T')[0],
            fecha_fin: fechaFin.toISOString().split('T')[0],
            cerrado: body.cerrado || false,
            observaciones: body.observaciones || null,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear período de facturación', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update periodo by ID
    if (req.method === 'PUT' && id) {
      const body = await req.json();

      const { data, error } = await supabase
        .from('periodos_facturacion')
        .update({
          cerrado: body.cerrado,
          observaciones: body.observaciones,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar período de facturación', 400, error);
      }

      return successResponse(data);
    }

    // DELETE periodo by ID (solo si no tiene facturas asociadas)
    if (req.method === 'DELETE' && id) {
      // Verificar que no tenga facturas asociadas
      const { data: facturas, error: facturasError } = await supabase
        .from('facturas')
        .select('id')
        .eq('periodo_id', id)
        .limit(1);

      if (facturasError) {
        return errorResponse('Error al verificar facturas asociadas', 500, facturasError);
      }

      if (facturas && facturas.length > 0) {
        return errorResponse('No se puede eliminar el período porque tiene facturas asociadas', 400);
      }

      const { error } = await supabase
        .from('periodos_facturacion')
        .delete()
        .eq('id', id);

      if (error) {
        return errorResponse('Error al eliminar período de facturación', 400, error);
      }

      return successResponse({ message: 'Período de facturación eliminado exitosamente' });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
