import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, DashboardKPI, ReporteFacturacionAnual, ReporteCobranza, ReportePacientesObraSocial, ReporteRentabilidad, ReporteConductor } from '../../shared/models/api.model';

@Injectable({
  providedIn: 'root'
})
export class ReportesService extends ApiService {
  getDashboard(): Observable<ApiResponse<DashboardKPI>> {
    return this.get<DashboardKPI>('reportes/dashboard');
  }

  getFacturacionAnual(anio: number): Observable<ApiResponse<ReporteFacturacionAnual[]>> {
    return this.get<ReporteFacturacionAnual[]>(`reportes/facturacion-anual?anio=${anio}`);
  }

  getCobranzasPendientes(obraSocialId?: string): Observable<ApiResponse<ReporteCobranza[]>> {
    const filters = obraSocialId ? { obra_social_id: obraSocialId } : {};
    return this.get<ReporteCobranza[]>('reportes/cobranzas-pendientes', filters);
  }

  getPacientesPorObraSocial(): Observable<ApiResponse<ReportePacientesObraSocial[]>> {
    return this.get<ReportePacientesObraSocial[]>('reportes/pacientes-obra-social');
  }

  getRentabilidadMensual(anio: number): Observable<ApiResponse<ReporteRentabilidad[]>> {
    return this.get<ReporteRentabilidad[]>(`reportes/rentabilidad-mensual?anio=${anio}`);
  }

  getConductores(mes: number, anio: number): Observable<ApiResponse<ReporteConductor[]>> {
    return this.get<ReporteConductor[]>(`reportes/conductores?mes=${mes}&anio=${anio}`);
  }

  getResumenAnual(anio: number): Observable<ApiResponse<any>> {
    return this.get<any>(`reportes/resumen-anual?anio=${anio}`);
  }

  getPresupuestoMensual(mes: number, anio: number): Observable<ApiResponse<any>> {
    return this.get<any>(`presupuesto-resumen/${mes}/${anio}`);
  }
}
