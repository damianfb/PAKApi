export interface ObraSocial {
  id: string;
  nombre: string;
  codigo: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string;
  telefono?: string;
  telefono_alternativo?: string;
  tutor_responsable?: string;
  telefono_tutor?: string;
  direccion_particular: string;
  localidad: string;
  provincia: string;
  obra_social_id: string;
  numero_afiliado?: string;
  tipo_dependencia: 'C/DEPEN' | 'S/DEPEN';
  observaciones?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conductor {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email?: string;
  direccion?: string;
  fecha_nacimiento: string;
  tipo_licencia: string;
  numero_licencia: string;
  vencimiento_licencia: string;
  fecha_ingreso: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Destino {
  id: string;
  nombre: string;
  tipo: 'escuela' | 'centro_terapeutico' | 'hospital' | 'clinica' | 'otro';
  direccion: string;
  localidad: string;
  provincia: string;
  telefono?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
  observaciones?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicioPaciente {
  id: string;
  paciente_id: string;
  destino_id: string;
  tipo_servicio: 'escuela' | 'terapia' | 'cet' | 'hidroterapia' | 'otro';
  dias_semana: string[]; // ['lunes', 'martes', etc.]
  hora_ida?: string;
  hora_vuelta?: string;
  kilometros_diarios: number;
  valor_por_km: number;
  monto_mensual_estimado: number;
  fecha_inicio: string;
  fecha_fin?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface HorarioTraslado {
  id: string;
  paciente_id: string;
  conductor_id: string;
  servicio_paciente_id: string;
  fecha: string;
  hora_programada: string;
  hora_real?: string;
  tipo_traslado: 'ida' | 'vuelta' | 'ida_vuelta';
  estado: 'programado' | 'en_curso' | 'completado' | 'cancelado';
  kilometros_recorridos?: number;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface TrasladoMensual {
  id: string;
  paciente_id: string;
  periodo_facturacion_id: string;
  servicio_paciente_id: string;
  cantidad_traslados_autorizados: number;
  cantidad_traslados_realizados: number;
  cantidad_traslados_excedidos: number;
  kilometros_totales: number;
  monto_obra_social: number;
  monto_paciente: number;
  monto_total: number;
  facturado: boolean;
  created_at: string;
  updated_at: string;
}

export interface Factura {
  id: string;
  numero_factura: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  periodo_id: string;
  obra_social_id?: string;
  subtotal: number;
  impuestos: number;
  monto_total: number;
  estado: 'borrador' | 'emitida' | 'enviada' | 'cobrada' | 'pagada' | 'anulada';
  fecha_pago?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  // Relaciones expandidas
  periodo?: PeriodoFacturacion;
  obra_social?: ObraSocial;
  detalles?: FacturaDetalle[];
}

export interface FacturaDetalle {
  id: string;
  factura_id: string;
  traslado_mensual_id?: string;
  paciente_id?: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  // Relaciones expandidas
  paciente?: Paciente;
  traslado_mensual?: TrasladoMensual;
}

export interface Cobranza {
  id: string;
  obra_social_id: string;
  monto_total_facturado: number;
  monto_cobrado: number;
  monto_pendiente: number;
  fecha_inicio: string;
  fecha_corte: string;
  estado: 'activa' | 'parcial' | 'completa' | 'vencida';
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface Recibo {
  id: string;
  numero_recibo: string;
  cobranza_id: string;
  obra_social_id: string;
  fecha_cobro: string;
  monto_cobrado: number;
  metodo_pago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta_credito' | 'tarjeta_debito' | 'otro';
  numero_transaccion?: string;
  observaciones?: string;
  estado: 'borrador' | 'confirmado' | 'conciliado' | 'anulado';
  created_at: string;
  updated_at: string;
}

export interface GastoOperativo {
  id: string;
  conductor_id?: string;
  tipo_gasto: 'combustible' | 'mantenimiento' | 'peajes' | 'seguros' | 'impuestos' | 'otros';
  descripcion: string;
  monto: number;
  fecha_gasto: string;
  fecha_pago?: string;
  metodo_pago?: string;
  numero_comprobante?: string;
  estado: 'pendiente' | 'aprobado' | 'pagado' | 'rechazado';
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface LiquidacionConductor {
  id: string;
  conductor_id: string;
  periodo_facturacion_id: string;
  cantidad_traslados: number;
  monto_base: number;
  bonificaciones: number;
  deducciones: number;
  monto_neto: number;
  fecha_liquidacion: string;
  fecha_pago?: string;
  metodo_pago?: string;
  estado: 'borrador' | 'aprobado' | 'pagado';
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface PeriodoFacturacion {
  id: string;
  mes: number;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  cerrado: boolean;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface Usuario {
  id: string;
  email: string;
  nombre?: string;
  apellido?: string;
  rol: 'admin' | 'operador' | 'conductor' | 'viewer';
  activo: boolean;
  created_at: string;
  updated_at: string;
}
