import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Evento, Inscripcion } from '../shared/models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) { }

  getEvents(role?: string): Observable<Evento[]> {
    if (role === 'manager') {
      return this.http.get<Evento[]>(`${this.apiUrl}/managed`);
    }
    return this.http.get<Evento[]>(this.apiUrl);
  }

  getEventById(id: string, role?: string): Observable<Evento> {
    const url = role ? `${this.apiUrl}/${id}?role=${role}` : `${this.apiUrl}/${id}`;
    return this.http.get<Evento>(url);
  }

  createEvent(event: Partial<Evento>): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, event);
  }

  updateEvent(id: string, event: Partial<Evento>): Observable<Evento> {
    return this.http.patch<Evento>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAssignedEvents(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/assigned`);
  }

  assignJury(eventId: string, userId: string): Observable<Evento> {
    return this.http.post<Evento>(`${this.apiUrl}/${eventId}/juries`, { userId });
  }

  removeJury(eventId: string, userId: string): Observable<Evento> {
    return this.http.delete<Evento>(`${this.apiUrl}/${eventId}/juries/${userId}`);
  }

  getEventsByStatus(status: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}?status=${status}`);
  }

  registerParticipant(eventId: string, participant: Partial<Inscripcion>): Observable<Inscripcion> {
    return this.http.post<Inscripcion>(`${this.apiUrl}/${eventId}/participants`, participant);
  }

  getEventParticipants(eventId: string): Observable<Inscripcion[]> {
    return this.http.get<Inscripcion[]>(`${this.apiUrl}/${eventId}/participants`);
  }
}