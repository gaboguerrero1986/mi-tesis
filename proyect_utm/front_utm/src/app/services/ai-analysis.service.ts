import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EvaluationSummary, SentimentAnalysis } from '../shared/models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class AiAnalysisService {
  private apiUrl = environment.aiServiceUrl;

  constructor(private http: HttpClient) {}

  analyzeEventFeedback(eventId: string): Observable<EvaluationSummary> {
    return this.http.post<EvaluationSummary>(`${this.apiUrl}/analyze/event-feedback`, { eventId });
  }

  generateSentimentAnalysis(comments: string[]): Observable<SentimentAnalysis> {
    return this.http.post<SentimentAnalysis>(`${this.apiUrl}/analyze/sentiment`, { comments });
  }

  extractCommonThemes(comments: string[]): Observable<string[]> {
    return this.http.post<string[]>(`${this.apiUrl}/analyze/themes`, { comments });
  }

  generateAiReport(eventData: any): Observable<{ report: string; recommendations: string[] }> {
    return this.http.post<{ report: string; recommendations: string[] }>(
      `${this.apiUrl}/reports/generate`,
      eventData
    );
  }

  predictEventSuccess(metrics: any): Observable<{ successProbability: number; factors: string[] }> {
    return this.http.post<{ successProbability: number; factors: string[] }>(
      `${this.apiUrl}/predict/success`,
      { metrics }
    );
  }
}