import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ParametroEAV {
  id?: number;
  entidad_id?: number;
  codigo_parametro?: number;
  descripcion: string;
  tipo_dato: string;
  is_active?: boolean;
}

export interface EjecucionParametroEAV {
  id?: number;
  parametro_id: number;
  registro_id: string;
  valor_texto?: string;
  valor_numerico?: number;
  parametro?: ParametroEAV;
}

@Injectable({
  providedIn: 'root'
})
export class EavService {
  private apiUrl = `${environment.apiUrl}/eav`;

  constructor(private http: HttpClient) { }

  // Obtener parámetros configurados para una entidad (ej. 'Evento', 'Participante')
  getParameters(entity: string, activeOnly: boolean = false): Observable<ParametroEAV[]> {
    return this.http.get<ParametroEAV[]>(`${this.apiUrl}/parameters?entity=${entity}&activeOnly=${activeOnly}`);
  }

  // Crear un nuevo campo dinámico para una entidad
  createParameter(entity: string, description: string, dataType: string): Observable<ParametroEAV> {
    return this.http.post<ParametroEAV>(`${this.apiUrl}/parameters`, { entity, description, dataType });
  }

  // Eliminar un campo dinámico
  deleteParameter(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/parameters/${id}`);
  }

  // Activar/Desactivar un campo dinámico
  toggleParameter(id: string | number): Observable<ParametroEAV> {
    return this.http.post<ParametroEAV>(`${this.apiUrl}/parameters/${id}/toggle`, {});
  }

  // Obtener los valores llenados para un registro específico (ID de evento, participante, etc.)
  getValues(recordId: string): Observable<EjecucionParametroEAV[]> {
    return this.http.get<EjecucionParametroEAV[]>(`${this.apiUrl}/values/${recordId}`);
  }

  // Guardar multiples valores a la vez para un registro
  saveBatchValues(recordId: string, values: { parameterId: number, value: any }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/values/batch/${recordId}`, { values });
  }
}
