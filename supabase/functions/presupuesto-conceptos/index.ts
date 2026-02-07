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
    const id = pathParts[pathParts.length - 1] !== 'presupuesto-conceptos' ? pathParts[pathParts.length - 1] : null;

    // GET single concepto by ID
    if (req.method === 'GET' && id && id.match(/^[0-9a-f-]{36}$/i)) {
      const { data, error } = await supabase
        .from('presupuesto_conceptos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Concepto no encontrado', 404, error);
      }

      return successResponse(data);
    }

    // GET all conceptos
    if (req.method === 'GET') {
      const activo = url.searchParams.get('activo');
      const tipo = url.searchParams.get('tipo');
      const categoria = url.searchParams.get('categoria');

      let query = supabase
        .from('presupuesto_conceptos')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nombre', { ascending: true });

      if (activo !== null) {
        query = query.eq('activo', activo === 'true');
      }
      if (tipo) {
        query = query.eq('tipo', tipo);
      }
      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      const { data, error } = await query;

      if (error) {
        return errorResponse('Error al obtener conceptos', 500, error);
      }

      return successResponse(data);
    }

    // POST create new concepto
    if (req.method === 'POST') {
      const body = await req.json();

      if (!body.nombre || !body.categoria || !body.tipo) {
        return errorResponse('Se requieren nombre, categoria y tipo', 400);
      }

      const { data, error } = await supabase
        .from('presupuesto_conceptos')
        .insert([{
          nombre: body.nombre,
          categoria: body.categoria,
          tipo: body.tipo,
          monto_base: body.monto_base || 0,
          dia_vencimiento: body.dia_vencimiento || null,
          es_recurrente: body.es_recurrente ?? true,
          activo: body.activo ?? true,
          observaciones: body.observaciones || null
        }])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear concepto', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update concepto
    if (req.method === 'PUT' && id) {
      const body = await req.json();

      const updateData: any = {};
      if (body.nombre !== undefined) updateData.nombre = body.nombre;
      if (body.categoria !== undefined) updateData.categoria = body.categoria;
      if (body.tipo !== undefined) updateData.tipo = body.tipo;
      if (body.monto_base !== undefined) updateData.monto_base = body.monto_base;
      if (body.dia_vencimiento !== undefined) updateData.dia_vencimiento = body.dia_vencimiento;
      if (body.es_recurrente !== undefined) updateData.es_recurrente = body.es_recurrente;
      if (body.activo !== undefined) updateData.activo = body.activo;
      if (body.observaciones !== undefined) updateData.observaciones = body.observaciones;

      const { data, error } = await supabase
        .from('presupuesto_conceptos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar concepto', 400, error);
      }

      return successResponse(data);
    }

    // DELETE concepto
    if (req.method === 'DELETE' && id) {
      const { error } = await supabase
        .from('presupuesto_conceptos')
        .delete()
        .eq('id', id);

      if (error) {
        return errorResponse('Error al eliminar concepto', 400, error);
      }

      return successResponse({ deleted: true });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error);
  }
});
