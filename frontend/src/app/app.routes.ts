import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './core/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PacientesListComponent } from './features/pacientes/pacientes-list/pacientes-list.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'pacientes',
        component: PacientesListComponent
      },
      {
        path: 'horarios',
        loadComponent: () => import('./features/horarios/horarios-list/horarios-list.component').then(m => m.HorariosListComponent)
      },
      {
        path: 'facturacion',
        loadComponent: () => import('./features/facturacion/facturacion-list/facturacion-list.component').then(m => m.FacturacionListComponent)
      },
      {
        path: 'cobranza',
        loadComponent: () => import('./features/cobranza/cobranza-list/cobranza-list.component').then(m => m.CobranzaListComponent)
      },
      {
        path: 'presupuesto',
        loadComponent: () => import('./features/presupuesto/presupuesto-view/presupuesto-view.component').then(m => m.PresupuestoViewComponent)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/reportes/reportes-view/reportes-view.component').then(m => m.ReportesViewComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

