import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { ReportService } from '../../services/report.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-reports-dashboard',
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.scss'],
  providers: [MessageService]
})
export class ReportsDashboardComponent implements OnInit {
  biChartData: any;
  biChartOptions: any;

  completedEvents: any[] = [];
  selectedEvent: any = null;
  loadingBI: boolean = false;
  
  // BI Data
  metricasData: any[] = [];
  biStats: any = null;
  reportGeneratedDate: Date | null = null;

  constructor(
    private eventService: EventService,
    private reportService: ReportService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadCompletedEvents();
    this.initChartOptions();
  }

  loadCompletedEvents(): void {
    this.eventService.getEvents().subscribe(events => {
      this.completedEvents = events.filter(e => e.estado === 'completado' || e.estado === 'publicado');
    });
  }

  onEventSelect(): void {
    this.metricasData = [];
    this.biStats = null;
  }

  generateBIReport(): void {
    if (!this.selectedEvent) return;

    this.loadingBI = true;
    this.messageService.add({ severity: 'info', summary: 'Generando Analíticas', detail: 'Calculando estadísticas del evento...' });

    this.reportService.getReport(this.selectedEvent.id).subscribe({
      next: (res) => {
        this.loadingBI = false;
        if (res.error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.error });
          return;
        }

        if (res.data) {
          this.metricasData = res.data.metricas;
          this.biStats = res.data.biStats;
          this.reportGeneratedDate = new Date();
          this.updateChartData();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reporte BI generado correctamente' });
        }
      },
      error: (err) => {
        this.loadingBI = false;
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al generar reporte BI' });
      }
    });
  }

  updateChartData(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    
    // Tomar todas las métricas para graficar
    const labels = this.metricasData.map(m => m.metrica);
    const scores = this.metricasData.map(m => Number(m.puntaje_promedio));

    this.biChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Nota Final',
          data: scores,
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          borderColor: documentStyle.getPropertyValue('--blue-700'),
          borderWidth: 1
        }
      ]
    };
  }

  initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.biChartOptions = {
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        y: {
          beginAtZero: true,
          max: 5, // Student metrics are 1 to 5
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    };
  }

  downloadReport(): void {
    const element = document.getElementById('bi-report-content');
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `Reporte_BI_${this.selectedEvent.titulo.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    // @ts-ignore
    import('html2pdf.js').then((html2pdfLib) => {
      const pdfFunction: any = html2pdfLib.default ? html2pdfLib.default : html2pdfLib;
      if (typeof pdfFunction === 'function') {
        pdfFunction().from(element).set(opt).save();
      }
    });
  }
}