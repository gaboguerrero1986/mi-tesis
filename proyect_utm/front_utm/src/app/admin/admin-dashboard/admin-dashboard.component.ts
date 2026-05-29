import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StatsService } from '../../services/stats.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  activeTab: string = 'dashboard';
  sidebarVisible: boolean = false;
  sidebarCollapsed: boolean = false;

  stats: any = {
    activeEvents: 0,
    totalJuries: 0,
    totalEvaluations: 0
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private statsService: StatsService
  ) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.statsService.getDashboardStats().subscribe(data => {
      this.stats = data;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  toggleCollapse(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  getTitle(): string {
    switch (this.activeTab) {
      case 'dashboard': return 'Dashboard General';
      case 'events': return 'Gestión de Eventos';
      case 'juries': return 'Gestión de Jurados';
      case 'managers': return 'Gestión de Responsables';
      case 'metrics': return 'Métricas Globales';
      case 'reports': return 'Reportes y Análisis';
      default: return 'Panel de Administración';
    }
  }

}