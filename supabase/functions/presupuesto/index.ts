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
    const id = pathParts[pathParts.length - 1] !== 'presupuesto' ? pathParts[pathParts.length - 1] : null;

    // GET single movimiento by ID
    if (req.method === 'GET' && id && id.match(/^[0-9a-f-]{36}$/i)) {
      const { data, error } = await supabase
        .from('presupuesto_movimientos')
        .select('*, concepto:presupuesto_conceptos(*)')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Movimiento no encontrado', 404, error);
      }

      return successResponse(data);
    }

    // GET all movimientos or by periodo
    if (req.method === 'GET') {
      const periodo = url.searchParams.get('periodo');
      const tipo = url.searchParams.get('tipo');
      const estado = url.searchParams.get('estado');
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const page = parseInt(url.searchParams.get('page') || '1');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('presupuesto_movimientos')
        .select('*, concepto:presupuesto_conceptos(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (periodo) {
        query = query.eq('periodo', periodo);
      }
      if (tipo) {
        query = query.eq('tipo', tipo);
      }
      if (estado) {
        query = query.eq('estado', estado);
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener movimientos', 500, error);
      }

      // Calculate totals
      let totalIngresos = 0;
      let totalEgresos = 0;
      let totalPagado = 0;
      let totalPendiente = 0;

      data?.forEach((m: any) => {
        const monto = parseFloat(m.monto) || 0;
        const pagado = parseFloat(m.monto_pagado) || 0;
        const tipoMov = m.tipo || m.concepto?.tipo;
        
        if (tipoMov === 'ingreso') {
          totalIngresos += monto;
        } else {
          totalEgresos += monto;
        }
        totalPagado += pagado;
        totalPendiente += monto - pagado;
      });

      return successResponse({
        data,
        totals: {
          ingresos: totalIngresos,
          egresos: totalEgresos,
          pagado: totalPagado,
          pendiente: totalPendiente,
          resultado: totalIngresos - totalEgresos
        },
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        }
      });
    }

    // POST create new movimiento
    if (req.method === 'POST') {
      const body = await req.json();

      if (!body.periodo || !body.monto) {
        return errorResponse('Se requieren periodo y monto', 400);
      }

      const insertData: any = {
        periodo: body.periodo,
        monto: body.monto,
        monto_pagado: body.monto_pagado || 0,
        estado: body.estado || 'pendiente',
        observaciones: body.observaciones || null,
        fecha_pago: body.fecha_pago || null
      };

      // Si tiene concepto_id, usar el concepto
      if (body.concepto_id) {
        insertData.concepto_id = body.concepto_id;
      } else {
        // Movimiento sin concepto - requiere nombre, categoria, tipo
        if (!body.nombre || !body.tipo) {
          return errorResponse('Se requieren nombre y tipo para movimientos sin concepto', 400);
        }
        insertData.nombre = body.nombre;
        insertData.categoria = body.categoria || 'otros';
        insertData.tipo = body.tipo;
      }

      const { data, error } = await supabase
        .from('presupuesto_movimientos')
        .insert([insertData])
        .select('*, concepto:presupuesto_conceptos(*)')
        .single();

      if (error) {
        return errorResponse('Error al crear movimiento', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update movimiento
    if (req.method === 'PUT' && id) {
      const body = await req.json();

      const updateData: any = {};
      if (body.monto !== undefined) updateData.monto = body.monto;
      if (body.monto_pagado !== undefined) {
        updateData.monto_pagado = body.monto_pagado;
        // Auto-update estado
        const montoTotal = body.monto ?? 0;
        if (body.monto_pagado >= montoTotal && montoTotal > 0) {
          updateData.estado = 'pagado';
        } else if (body.monto_pagado > 0) {
          updateData.estado = 'parcial';
        }
      }
      if (body.estado !== undefined) updateData.estado = body.estado;
      if (body.fecha_pago !== undefined) updateData.fecha_pago = body.fecha_pago;
      if (body.observaciones !== undefined) updateData.observaciones = body.observaciones;
      if (body.nombre !== undefined) updateData.nombre = body.nombre;
      if (body.categoria !== undefined) updateData.categoria = body.categoria;

      const { data, error } = await supabase
        .from('presupuesto_movimientos')
        .update(updateData)
        .eq('id', id)
        .select('*, concepto:presupuesto_conceptos(*)')
        .single();

      if (error) {
        return errorResponse('Error al actualizar movimiento', 400, error);
      }

      return successResponse(data);
    }

    // DELETE movimiento
    if (req.method === 'DELETE' && id) {
      const { error } = await supabase
        .from('presupuesto_movimientos')
        .delete()
        .eq('id', id);

      if (error) {
        return errorResponse('Error al eliminar movimiento', 400, error);
      }

      return successResponse({ deleted: true });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error);
  }
});
