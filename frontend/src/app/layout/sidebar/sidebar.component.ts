import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
    selector: 'app-sidebar',
    imports: [
        CommonModule,
        RouterModule,
        MatListModule,
        MatIconModule
    ],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Pacientes', icon: 'people', route: '/pacientes' },
    { label: 'Horarios', icon: 'schedule', route: '/horarios' },
    { label: 'Facturación', icon: 'receipt', route: '/facturacion' },
    { label: 'Cobranza', icon: 'payments', route: '/cobranza' },
    { label: 'Presupuesto', icon: 'account_balance', route: '/presupuesto' },
    { label: 'Reportes', icon: 'assessment', route: '/reportes' }
  ];
}
