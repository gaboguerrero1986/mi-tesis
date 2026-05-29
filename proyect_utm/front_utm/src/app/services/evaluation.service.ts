import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Evaluacion, EvaluationSummary } from '../shared/models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = `${environment.apiUrl}/evaluations`;

  constructor(private http: HttpClient) { }

  submitEvaluation(evaluation: Partial<Evaluacion>): Observable<Evaluacion> {
    return this.http.post<Evaluacion>(this.apiUrl, evaluation);
  }

  getEvaluationsByEvent(eventId: string): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(`${this.apiUrl}?eventId=${eventId}`);
  }

  getEvaluationSummary(eventId: string): Observable<EvaluationSummary> {
    return this.http.get<EvaluationSummary>(`${environment.apiUrl}/reports/${eventId}`);
  }

  getMyEvaluatedEventIds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/my-evaluations`);
  }

  getUserEvaluations(userId: string): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(`${this.apiUrl}/user/${userId}`);
  }

  deleteEvaluation(evaluationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${evaluationId}`);
  }
}