import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api.model';
import { PeriodoFacturacion } from '../../shared/models/entities.model';

export interface PeriodosFilters {
  anio?: number;
  cerrado?: boolean;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PeriodosService extends ApiService {
  private endpoint = 'periodos-facturacion';

  getAll(filters?: PeriodosFilters): Observable<ApiResponse<PeriodoFacturacion[]>> {
    return this.get<PeriodoFacturacion[]>(this.endpoint, filters);
  }

  getPeriodoById(id: string): Observable<ApiResponse<PeriodoFacturacion>> {
    return super.getById<PeriodoFacturacion>(this.endpoint, id);
  }

  create(periodo: Partial<PeriodoFacturacion>): Observable<ApiResponse<PeriodoFacturacion>> {
    return this.post<PeriodoFacturacion>(this.endpoint, periodo);
  }

  update(id: string, periodo: Partial<PeriodoFacturacion>): Observable<ApiResponse<PeriodoFacturacion>> {
    return this.put<PeriodoFacturacion>(this.endpoint, id, periodo);
  }

  remove(id: string): Observable<ApiResponse<any>> {
    return this.delete(this.endpoint, id);
  }

  // Método helper para obtener el nombre formateado del período
  formatPeriodo(periodo: PeriodoFacturacion): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[periodo.mes - 1]} ${periodo.anio}`;
  }

  // Cerrar un período
  cerrarPeriodo(id: string): Observable<ApiResponse<PeriodoFacturacion>> {
    return this.put<PeriodoFacturacion>(this.endpoint, id, { cerrado: true });
  }

  // Abrir un período
  abrirPeriodo(id: string): Observable<ApiResponse<PeriodoFacturacion>> {
    return this.put<PeriodoFacturacion>(this.endpoint, id, { cerrado: false });
  }
}
