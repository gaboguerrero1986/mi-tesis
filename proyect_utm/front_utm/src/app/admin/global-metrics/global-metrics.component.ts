import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { MetricService } from '../../services/metric.service';
import { Metrica } from '../../shared/models/metric.model';

@Component({
    selector: 'app-global-metrics',
    templateUrl: './global-metrics.component.html',
    styleUrls: ['./global-metrics.component.scss']
})
export class GlobalMetricsComponent implements OnInit {
    metrics: Metrica[] = [];
    metricForm: FormGroup;
    displayDialog = false;
    isEditing = false;
    editingMetricId: number | null = null;
    loading = false;

    metricTypes = [
        { label: 'Cuantitativa (Numérica)', value: 'quantitative' },
        { label: 'Cualitativa (Texto)', value: 'qualitative' }
    ];

    constructor(
        private metricService: MetricService,
        private fb: FormBuilder,
        private messageService: MessageService
    ) {
        this.metricForm = this.fb.group({
            name: ['', Validators.required],
            type: ['quantitative', Validators.required],
            targetRole: ['student', Validators.required],
            minVal: [1],
            maxVal: [10]
        });
    }

    ngOnInit(): void {
        this.loadMetrics();
    }

    loadMetrics(): void {
        this.loading = true;
        this.metricService.getGlobalMetrics().subscribe({
            next: (metrics) => {
                this.metrics = metrics;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las métricas globales' });
            }
        });
    }

    showDialog(metric?: Metrica): void {
        this.displayDialog = true;
        if (metric) {
            this.isEditing = true;
            this.editingMetricId = metric.id || null;
            this.metricForm.patchValue({
                name: metric.nombre,
                type: 'quantitative',
                targetRole: metric.rol_evaluador || 'student',
                minVal: 1,
                maxVal: 5
            });
        } else {
            this.isEditing = false;
            this.editingMetricId = null;
            this.metricForm.reset({
                type: 'quantitative',
                targetRole: 'student',
                minVal: 1,
                maxVal: 5
            });
        }
    }

    saveMetric(): void {
        if (this.metricForm.invalid) return;

        const formValues = this.metricForm.value;
        const metricData: any = {
            nombre: formValues.name,
            rol_evaluador: formValues.targetRole,
            peso_porcentual: 100, // or whatever default
            evento_id: null
        };

        if (this.isEditing && this.editingMetricId) {
            this.metricService.updateGlobalMetric(this.editingMetricId, metricData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Métrica actualizada' });
                    this.displayDialog = false;
                    this.loadMetrics();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
            });
        } else {
            this.metricService.createMetric(metricData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Métrica creada' });
                    this.displayDialog = false;
                    this.loadMetrics();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' })
            });
        }
    }

    deleteMetric(id: number): void {
        this.metricService.deleteMetric(id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Métrica eliminada' });
                this.loadMetrics();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
        });
    }
}
