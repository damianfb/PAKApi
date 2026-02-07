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
  telefono?: string;
  email?: string;
  licencia_conducir?: string;
  licencia_vencimiento?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Destino {
  id: string;
  nombre: string;
  direccion: string;
  ciudad?: string;
  provincia?: string;
  codigo_postal?: string;
  telefono?: string;
  tipo?: string;
  coordenadas_lat?: number;
  coordenadas_lng?: number;
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
  cantidad_mensual?: number; // Días de asistencia al mes
  numero_autorizacion?: string; // Número de autorización de obra social
  observaciones?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones expandidas
  destino?: Destino;
  paciente?: Paciente;
}

export interface HorarioTraslado {
  id: string;
  paciente_id: string;
  conductor_id: string;
  servicio_paciente_id?: string;
  destino_id?: string;
  traslado_mensual_id?: string;
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  hora_salida_real?: string;
  hora_llegada_real?: string;
  tipo_traslado: 'ida' | 'vuelta' | 'ida_vuelta';
  estado: 'programado' | 'confirmado' | 'en_curso' | 'completado' | 'cancelado' | 'no_realizado';
  distancia_km?: number;
  kilometros_recorridos?: number;
  observaciones?: string;
  motivo_cancelacion?: string;
  paciente?: any;
  conductor?: any;
  destino?: any;
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
  numero_cobranza: string;
  fecha_cobranza: string;
  obra_social_id?: string;
  periodo_id?: string;
  monto_total: number;
  monto_cobrado: number;
  monto_pendiente: number;
  estado: 'pendiente' | 'parcial' | 'cobrado' | 'anulado';
  fecha_vencimiento?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  // Relaciones expandidas
  obra_social?: ObraSocial;
  periodo?: PeriodoFacturacion;
  recibos?: Recibo[];
}

export interface Recibo {
  id: string;
  numero_recibo: string;
  fecha_emision: string;
  fecha_pago: string;
  cobranza_id?: string;
  obra_social_id?: string;
  monto_total: number;
  metodo_pago?: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';
  numero_operacion?: string;
  estado: 'emitido' | 'confirmado' | 'anulado';
  observaciones?: string;
  created_at: string;
  updated_at: string;
  // Relaciones expandidas
  cobranza?: Cobranza;
  obra_social?: ObraSocial;
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
  periodo: string; // Formato YYYY-MM
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'abierto' | 'cerrado' | 'facturado';
  fecha_cierre?: string;
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
