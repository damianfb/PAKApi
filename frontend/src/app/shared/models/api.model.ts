export interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  details?: any;
}

export interface DashboardKPI {
  totalFacturado: number;
  pendienteCobro: number;
  viajesHoy: number;
  pacientesActivos: number;
  conductoresActivos: number;
}

export interface ReporteFacturacionAnual {
  obra_social: string;
  enero: number;
  febrero: number;
  marzo: number;
  abril: number;
  mayo: number;
  junio: number;
  julio: number;
  agosto: number;
  septiembre: number;
  octubre: number;
  noviembre: number;
  diciembre: number;
  total_anual: number;
}

export interface ReporteCobranza {
  factura_numero: string;
  obra_social: string;
  fecha_emision: string;
  monto_total: number;
  monto_cobrado: number;
  monto_pendiente: number;
  dias_vencido: number;
  estado: string;
}

export interface ReportePacientesObraSocial {
  obra_social: string;
  cantidad_pacientes: number;
  cantidad_servicios: number;
  kilometros_mensuales: number;
  facturacion_mensual: number;
}

export interface ReporteRentabilidad {
  mes: string;
  ingresos: number;
  gastos: number;
  ganancia: number;
  margen_porcentaje: number;
}

export interface ReporteConductor {
  conductor: string;
  cantidad_viajes: number;
  kilometros_recorridos: number;
  monto_liquidado: number;
  promedio_km_viaje: number;
}
