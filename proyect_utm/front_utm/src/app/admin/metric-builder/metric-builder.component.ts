import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-metric-builder',
  templateUrl: './metric-builder.component.html',
  styleUrls: ['./metric-builder.component.scss']
})
export class MetricBuilderComponent implements OnInit {
  metrics: any[] = [];
  metricForm: FormGroup;
  displayMetricDialog = false;
  metricTypes = [
    { label: 'Cuantitativa', value: 'quantitative' },
    { label: 'Cualitativa', value: 'qualitative' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.metricForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: ['quantitative', Validators.required],
      weight: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      maxScore: [10],
      required: [true]
    });
  }

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    // Datos de ejemplo
    this.metrics = [
      {
        id: '1',
        name: 'Calidad del Contenido',
        description: 'Evaluación de la calidad del contenido presentado',
        type: 'quantitative',
        weight: 30,
        maxScore: 10,
        required: true
      },
      {
        id: '2',
        name: 'Organización',
        description: 'Evaluación de la organización del evento',
        type: 'quantitative',
        weight: 25,
        maxScore: 10,
        required: true
      }
    ];
  }

  showMetricDialog(): void {
    this.displayMetricDialog = true;
    this.metricForm.reset({
      type: 'quantitative',
      weight: 0,
      maxScore: 10,
      required: true
    });
  }

  saveMetric(): void {
    if (this.metricForm.valid) {
      const metricData = this.metricForm.value;
      this.metrics.push({
        ...metricData,
        id: (this.metrics.length + 1).toString()
      });
      
      this.displayMetricDialog = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Métrica creada correctamente'
      });
    }
  }
}