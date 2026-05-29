import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Winner {
    participantId: string;
    name: string;
    averageScore: number;
    evaluationCount: number;
    rank: number;
}

export interface WinnersResponse {
    winners: Winner[];
    allParticipants: Winner[];
}

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private apiUrl = `${environment.apiUrl}/reports`;

    constructor(private http: HttpClient) { }

    getWinners(eventId: string): Observable<WinnersResponse> {
        return this.http.get<WinnersResponse>(`${this.apiUrl}/${eventId}/winners`);
    }

    getReport(eventId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${eventId}`);
    }
}
