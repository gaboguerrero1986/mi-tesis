import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Metrica } from '../shared/models/metric.model';

export interface EvaluationForm {
  eventId: string;
  metrics: Metrica[];
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MetricService {
  private apiUrl = `${environment.apiUrl}/metrics`;

  constructor(private http: HttpClient) { }

  getMetrics(): Observable<Metrica[]> {
    return this.http.get<Metrica[]>(this.apiUrl);
  }

  getMetricsByEvent(eventId: string): Observable<Metrica[]> {
    return this.http.get<Metrica[]>(`${this.apiUrl}?eventId=${eventId}`);
  }

  createMetric(metric: Partial<Metrica>): Observable<Metrica> {
    return this.http.post<Metrica>(this.apiUrl, metric);
  }

  updateMetric(id: number, metric: Partial<Metrica>): Observable<Metrica> {
    return this.http.put<Metrica>(`${this.apiUrl}/${id}`, metric);
  }

  getGlobalMetrics(): Observable<Metrica[]> {
    return this.http.get<Metrica[]>(`${this.apiUrl}/global`);
  }

  updateGlobalMetric(id: number, metric: Partial<Metrica>): Observable<Metrica> {
    return this.http.patch<Metrica>(`${this.apiUrl}/global/${id}`, metric);
  }

  deleteMetric(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createEvaluationForm(form: EvaluationForm): Observable<EvaluationForm> {
    return this.http.post<EvaluationForm>(`${this.apiUrl}/forms`, form);
  }

  getEvaluationForm(eventId: string): Observable<EvaluationForm> {
    return this.http.get<EvaluationForm>(`${this.apiUrl}/forms/event/${eventId}`);
  }
}