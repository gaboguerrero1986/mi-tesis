import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { EventService } from '../../services/event.service';
import { EvaluationService } from '../../services/evaluation.service';
import { Evento, Inscripcion } from '../../shared/models/event.model';
import { Metrica } from '../../shared/models/metric.model';

@Component({
  selector: 'app-jury-evaluation',
  templateUrl: './jury-evaluation.component.html',
  styleUrls: ['./jury-evaluation.component.scss']
})
export class JuryEvaluationComponent implements OnInit {
  eventId: string | null = null;
  event: Evento | null = null;
  evaluationForm: FormGroup;
  loading = true;
  submitting = false;

  // Participant management
  participants: Inscripcion[] = [];
  selectedParticipantId: string | null = null;
  evaluatedParticipants: Set<string> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private eventService: EventService,
    private evaluationService: EvaluationService,
    private messageService: MessageService
  ) {
    this.evaluationForm = this.fb.group({
      comments: [''],
      details: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.loadEvent(this.eventId);
    } else {
      this.router.navigate(['/jury']);
    }
  }

  get details(): FormArray {
    return this.evaluationForm.get('details') as FormArray;
  }

  loadEvent(id: string): void {
    this.loading = true;
    this.eventService.getEventById(id, 'jury').subscribe({
      next: (event: Evento) => {
        this.event = event;
        this.participants = event.inscripciones || [];

        // If event has participants, select the first one
        if (this.participants.length > 0) {
          this.selectedParticipantId = this.participants[0].id || null;
        }

        const juryMetrics = (event.metricas || []).filter(m => m.rol_evaluador === 'jury' || !m.rol_evaluador);
        this.initForm(juryMetrics);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading event', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el evento' });
        this.router.navigate(['/jury']);
      }
    });
  }

  initForm(metrics: Metrica[]): void {
    this.details.clear();
    metrics.forEach(metric => {
      const group = this.fb.group({
        metricId: [metric.id, Validators.required],
        metricName: [metric.nombre],
        metricType: ['quantitative'],
        minVal: [1],
        maxVal: [5],
        value: [null],
        textValue: ['']
      });

      group.get('value')?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(5)
      ]);

      this.details.push(group);
    });
  }

  selectParticipant(participantId: string): void {
    if (this.selectedParticipantId && !this.evaluatedParticipants.has(this.selectedParticipantId)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debe evaluar al participante actual antes de cambiar'
      });
      return;
    }

    this.selectedParticipantId = participantId;
    this.evaluationForm.reset();
    const juryMetrics = (this.event?.metricas || []).filter(m => m.rol_evaluador === 'jury' || !m.rol_evaluador);
    this.initForm(juryMetrics);
  }

  onSubmit(): void {
    if (this.evaluationForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor complete todos los campos requeridos' });
      return;
    }

    // Check if event has participants
    if (this.participants.length > 0 && !this.selectedParticipantId) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Debe seleccionar un participante' });
      return;
    }

    this.submitting = true;
    const formValue = this.evaluationForm.value;

    const evaluationData: any = {
      eventId: this.eventId,
      participantId: this.selectedParticipantId, // Include participant ID
      comments: formValue.comments,
      details: formValue.details.map((detail: any) => ({
        metricId: detail.metricId,
        value: detail.metricType === 'quantitative' ? detail.value : null,
        textValue: detail.metricType === 'qualitative' ? detail.textValue : null
      }))
    };

    this.evaluationService.submitEvaluation(evaluationData).subscribe({
      next: () => {
        if (this.selectedParticipantId) {
          this.evaluatedParticipants.add(this.selectedParticipantId);
        }

        // Check if all participants have been evaluated
        if (this.participants.length > 0 && this.evaluatedParticipants.size < this.participants.length) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Participante evaluado (${this.evaluatedParticipants.size}/${this.participants.length})`
          });

          // Select next unevaluated participant
          const nextParticipant = this.participants.find(p => !this.evaluatedParticipants.has(p.id!));
          if (nextParticipant) {
            this.selectedParticipantId = nextParticipant.id || null;
            this.evaluationForm.reset();
            const juryMetrics = (this.event?.metricas || []).filter(m => m.rol_evaluador === 'jury' || !m.rol_evaluador);
            this.initForm(juryMetrics);
          }
        } else {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evaluación completada exitosamente' });
          setTimeout(() => this.router.navigate(['/jury']), 1500);
        }

        this.submitting = false;
      },
      error: (err: any) => {
        console.error('Error submitting evaluation', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar la evaluación' });
        this.submitting = false;
      }
    });
  }

  getParticipantStatus(participantId: string): string {
    if (this.evaluatedParticipants.has(participantId)) {
      return 'evaluated';
    } else if (this.selectedParticipantId === participantId) {
      return 'selected';
    }
    return 'pending';
  }

  canSubmitFinalEvaluation(): boolean {
    if (this.participants.length === 0) {
      return true; // No participants, can submit directly
    }
    return this.evaluatedParticipants.size === this.participants.length;
  }

  getSelectedParticipantName(): string {
    if (!this.selectedParticipantId) return '';
    const participant = this.participants.find(p => p.id === this.selectedParticipantId);
    return participant?.nombre_equipo || 'Individual';
  }
}