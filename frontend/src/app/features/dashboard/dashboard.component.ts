import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportesService } from '../../core/services/reportes.service';
import { DashboardKPI } from '../../shared/models/api.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  kpis = signal<DashboardKPI | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private reportesService: ReportesService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.reportesService.getDashboard().subscribe({
      next: (response) => {
        this.kpis.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error cargando dashboard');
        this.loading.set(false);
        console.error('Error loading dashboard:', err);
        
        // Mock data for development
        this.kpis.set({
          totalFacturado: 1500000,
          pendienteCobro: 350000,
          viajesHoy: 45,
          pacientesActivos: 87,
          conductoresActivos: 5
        });
      }
    });
  }
}
