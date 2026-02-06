import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './core/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PacientesListComponent } from './features/pacientes/pacientes-list/pacientes-list.component';
import { CarteraListComponent } from './features/cartera/cartera-list/cartera-list.component';

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
        path: 'cartera',
        component: CarteraListComponent
      },
      {
        path: 'pacientes',
        component: PacientesListComponent
      },
      {
        path: 'pacientes/:id/servicios',
        loadComponent: () => import('./features/pacientes/servicios-paciente/servicios-list/servicios-list.component').then(m => m.ServiciosListComponent)
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
        path: 'periodos',
        loadComponent: () => import('./features/periodos/periodos-list/periodos-list.component').then(m => m.PeriodosListComponent)
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
      },
      {
        path: 'obras-sociales',
        loadComponent: () => import('./features/obras-sociales/obras-sociales-list/obras-sociales-list.component').then(m => m.ObrasSocialesListComponent)
      },
      {
        path: 'conductores',
        loadComponent: () => import('./features/conductores/conductores-list/conductores-list.component').then(m => m.ConductoresListComponent)
      },
      {
        path: 'destinos',
        loadComponent: () => import('./features/destinos/destinos-list/destinos-list.component').then(m => m.DestinosListComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

