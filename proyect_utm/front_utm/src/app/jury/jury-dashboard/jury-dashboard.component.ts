import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EvaluationService } from '../../services/evaluation.service';
import { Evento } from '../../shared/models/event.model';

@Component({
  selector: 'app-jury-dashboard',
  templateUrl: './jury-dashboard.component.html',
  styleUrls: ['./jury-dashboard.component.scss']
})
export class JuryDashboardComponent implements OnInit {
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
    this.eventService.getAssignedEvents().subscribe({
      next: (data) => {
        this.events = data;

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
    this.router.navigate(['/jury/evaluate', id]);
  }

  isEventActive(event: Evento): boolean {
    if (!event.fecha_inicio || !event.fecha_fin) return false;
    const now = new Date();
    const start = new Date(event.fecha_inicio);
    const end = new Date(event.fecha_fin);
    end.setHours(23, 59, 59, 999);
    return now >= start && now <= end;
  }
}