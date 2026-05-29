import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { EventService } from '../../services/event.service';
import { EvaluationService } from '../../services/evaluation.service';
import { Evento } from '../../shared/models/event.model';
import { Metrica } from '../../shared/models/metric.model';

@Component({
  selector: 'app-evaluation-form',
  templateUrl: './evaluation-form.component.html',
  styleUrls: ['./evaluation-form.component.scss']
})
export class EvaluationFormComponent implements OnInit {
  eventId: string | null = null;
  event: Evento | null = null;
  evaluationForm: FormGroup;
  loading = true;
  submitting = false;

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
      this.router.navigate(['/student']);
    }
  }

  get details(): FormArray {
    return this.evaluationForm.get('details') as FormArray;
  }

  loadEvent(id: string): void {
    this.loading = true;
    this.eventService.getEventById(id, 'student').subscribe({
      next: (event: Evento) => {
        this.event = event;
        const studentMetrics = (event.metricas || []).filter(m => m.rol_evaluador === 'student');
        this.initForm(studentMetrics);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading event', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el evento' });
        this.router.navigate(['/student']);
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

  onSubmit(): void {
    if (this.evaluationForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor complete todos los campos requeridos' });
      return;
    }

    this.submitting = true;
    const formValue = this.evaluationForm.value;

    // Transform form data to payload - FIXED: Changed 'metrics' to 'details' and property names
    const payload: any = {
      eventId: this.eventId!,
      comments: formValue.comments,
      details: formValue.details.map((d: any) => ({
        metricId: d.metricId,
        value: d.metricType === 'quantitative' ? d.value : null,
        textValue: d.metricType === 'qualitative' ? d.textValue : null
      }))
    };

    this.evaluationService.submitEvaluation(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evaluación enviada correctamente' });
        setTimeout(() => this.router.navigate(['/student']), 1500);
      },
      error: (err: any) => {
        console.error('Error submitting evaluation', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar la evaluación' });
        this.submitting = false;
      }
    });
  }
}