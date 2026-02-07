import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api.model';
import { HorarioTraslado } from '../../shared/models/entities.model';

@Injectable({
  providedIn: 'root'
})
export class HorariosService extends ApiService {
  private endpoint = 'horarios-traslados';

  getAll(filters?: any): Observable<ApiResponse<HorarioTraslado[]>> {
    return this.get<HorarioTraslado[]>(this.endpoint, filters);
  }

  getHorarioById(id: string): Observable<ApiResponse<HorarioTraslado>> {
    return super.getById<HorarioTraslado>(this.endpoint, id);
  }

  create(horario: Partial<HorarioTraslado>): Observable<ApiResponse<HorarioTraslado>> {
    return this.post<HorarioTraslado>(this.endpoint, horario);
  }

  update(id: string, horario: Partial<HorarioTraslado>): Observable<ApiResponse<HorarioTraslado>> {
    return this.put<HorarioTraslado>(this.endpoint, id, horario);
  }

  remove(id: string): Observable<ApiResponse<any>> {
    return this.delete(this.endpoint, id);
  }

  generarPeriodo(periodoId: string): Observable<ApiResponse<any>> {
    return this.post<any>('traslados-generar-periodo', { periodo_id: periodoId });
  }
}
