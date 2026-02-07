import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  mockStatus?: 'full' | 'none'; // full = 100% mock, none = API real
}

@Component({
    selector: 'app-sidebar',
    imports: [
        CommonModule,
        RouterModule
    ],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  showMockIndicators = false; // Toggle para desarrollo
  
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'fas fa-home', route: '/dashboard', mockStatus: 'none' },
    { label: 'Cartera de Pacientes', icon: 'fas fa-users', route: '/cartera', mockStatus: 'none' },
    { label: 'Pacientes', icon: 'fas fa-user-injured', route: '/pacientes', mockStatus: 'none' },
    { label: 'Horarios', icon: 'fas fa-calendar-alt', route: '/horarios', mockStatus: 'none' },
    { label: 'Facturación', icon: 'fas fa-file-invoice-dollar', route: '/facturacion', mockStatus: 'none' },
    { label: 'Períodos', icon: 'fas fa-calendar-check', route: '/periodos', mockStatus: 'none' },
    { label: 'Cobranza', icon: 'fas fa-money-bill-wave', route: '/cobranza', mockStatus: 'none' },
    { label: 'Presupuesto', icon: 'fas fa-chart-line', route: '/presupuesto', mockStatus: 'none' },
    { label: 'Reportes', icon: 'fas fa-chart-bar', route: '/reportes', mockStatus: 'none' },
    { label: 'Configuración', icon: 'fas fa-cog', route: '/configuracion', mockStatus: 'none' }
  ];

  getMockBadge(status?: string): string {
    return status === 'full' ? '🔶' : '';
  }

  getMockTooltip(status?: string): string {
    return status === 'full' ? 'Pantalla de desarrollo (datos de ejemplo)' : 'Conectado a API real';
  }
}
