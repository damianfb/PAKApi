import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
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
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'fas fa-home', route: '/dashboard' },
    { label: 'Cartera de Pacientes', icon: 'fas fa-users', route: '/cartera' },
    { label: 'Pacientes', icon: 'fas fa-user-injured', route: '/pacientes' },
    { label: 'Horarios', icon: 'fas fa-calendar-alt', route: '/horarios' },
    { label: 'Facturación', icon: 'fas fa-file-invoice-dollar', route: '/facturacion' },
    { label: 'Períodos', icon: 'fas fa-calendar-check', route: '/periodos' },
    { label: 'Cobranza', icon: 'fas fa-money-bill-wave', route: '/cobranza' },
    { label: 'Presupuesto', icon: 'fas fa-chart-line', route: '/presupuesto' },
    { label: 'Reportes', icon: 'fas fa-chart-bar', route: '/reportes' }
  ];
}
