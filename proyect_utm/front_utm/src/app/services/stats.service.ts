import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // Fix: Import Observable
import { environment } from 'src/environments/environment';

export interface DashboardStats {
    activeEvents: number;
    totalJuries: number;
    totalEvaluations: number;
}

@Injectable({
    providedIn: 'root'
})
export class StatsService {

    private apiUrl = `${environment.apiUrl}/stats`;

    constructor(private http: HttpClient) { }

    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(this.apiUrl);
    }
}
