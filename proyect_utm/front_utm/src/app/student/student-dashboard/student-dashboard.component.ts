import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EvaluationService } from '../../services/evaluation.service';
import { Evento } from '../../shared/models/event.model';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  events: (Evento & { ya_evaluado?: boolean })[] = [];
  loading = true;

  constructor(
    private eventService: EventService,
    private evaluationService: EvaluationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEvents().subscribe({
      next: (data) => {
        // Filter only published events
        this.events = data.filter(e => e.estado === 'publicado');
        
        // Fetch which ones the user has already evaluated
        this.evaluationService.getMyEvaluatedEventIds().subscribe({
          next: (evaluatedIds) => {
            this.events.forEach(e => {
              if (evaluatedIds.includes(e.id!)) {
                e.ya_evaluado = true;
              }
            });
            this.loading = false;
          },
          error: () => this.loading = false
        });
      },
      error: (err) => {
        console.error('Error loading events', err);
        this.loading = false;
      }
    });
  }

  evaluateEvent(id: string): void {
    this.router.navigate(['/student/evaluate', id]);
  }

  isEventActive(event: Evento): boolean {
    if (!event.fecha_inicio || !event.fecha_fin) return false;
    const now = new Date();
    const start = new Date(event.fecha_inicio);
    const end = new Date(event.fecha_fin);
    end.setHours(23, 59, 59, 999); // Permitir hasta el final del día de la fecha de fin
    return now >= start && now <= end;
  }
}