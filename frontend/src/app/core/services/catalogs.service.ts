import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api.model';
import { ObraSocial, Conductor, Destino } from '../../shared/models/entities.model';

@Injectable({
  providedIn: 'root'
})
export class ObrasSocialesService extends ApiService {
  private endpoint = 'obras-sociales';

  getAll(filters?: any): Observable<ApiResponse<ObraSocial[]>> {
    return this.get<ObraSocial[]>(this.endpoint, filters);
  }

  getById(id: string): Observable<ApiResponse<ObraSocial>> {
    return this.getById<ObraSocial>(this.endpoint, id);
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

@Injectable({
  providedIn: 'root'
})
export class ConductoresService extends ApiService {
  private endpoint = 'conductores';

  getAll(filters?: any): Observable<ApiResponse<Conductor[]>> {
    return this.get<Conductor[]>(this.endpoint, filters);
  }

  getById(id: string): Observable<ApiResponse<Conductor>> {
    return this.getById<Conductor>(this.endpoint, id);
  }

  create(conductor: Partial<Conductor>): Observable<ApiResponse<Conductor>> {
    return this.post<Conductor>(this.endpoint, conductor);
  }

  update(id: string, conductor: Partial<Conductor>): Observable<ApiResponse<Conductor>> {
    return this.put<Conductor>(this.endpoint, id, conductor);
  }

  remove(id: string): Observable<ApiResponse<any>> {
    return this.delete(this.endpoint, id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DestinosService extends ApiService {
  private endpoint = 'destinos';

  getAll(filters?: any): Observable<ApiResponse<Destino[]>> {
    return this.get<Destino[]>(this.endpoint, filters);
  }

  getById(id: string): Observable<ApiResponse<Destino>> {
    return this.getById<Destino>(this.endpoint, id);
  }

  create(destino: Partial<Destino>): Observable<ApiResponse<Destino>> {
    return this.post<Destino>(this.endpoint, destino);
  }

  update(id: string, destino: Partial<Destino>): Observable<ApiResponse<Destino>> {
    return this.put<Destino>(this.endpoint, id, destino);
  }

  remove(id: string): Observable<ApiResponse<any>> {
    return this.delete(this.endpoint, id);
  }
}
