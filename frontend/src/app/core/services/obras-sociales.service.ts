import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api.model';
import { ObraSocial } from '../../shared/models/entities.model';

export interface ObrasSocialesFilters {
  activo?: boolean;
  codigo?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ObrasSocialesService extends ApiService {
  private endpoint = 'obras-sociales';

  getAll(filters?: ObrasSocialesFilters): Observable<ApiResponse<ObraSocial[]>> {
    return this.get<ObraSocial[]>(this.endpoint, filters);
  }

  getObraSocialById(id: string): Observable<ApiResponse<ObraSocial>> {
    return super.getById<ObraSocial>(this.endpoint, id);
  }

  create(obraSocial: Partial<ObraSocial>): Observable<ApiResponse<ObraSocial>> {
    return this.post<ObraSocial>(this.endpoint, obraSocial);
  }

  update(id: string, obraSocial: Partial<ObraSocial>): Observable<ApiResponse<ObraSocial>> {
    return this.put<ObraSocial>(this.endpoint, id, obraSocial);
  }

  remove(id: string): Observable<ApiResponse<any>> {
    return this.delete(this.endpoint, id);
  }
}
