import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

interface PageInfo {
  title: string;
  subtitle: string;
}

@Component({
    selector: 'app-header',
    imports: [
        CommonModule
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  pageTitle = 'Dashboard';
  pageSubtitle = 'Resumen general del sistema';
  currentDate = '';
  showUserMenu = false;
  
  private routerSub?: Subscription;
  
  private pageTitles: Record<string, PageInfo> = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Resumen general del sistema' },
    '/cartera': { title: 'Cartera de Pacientes', subtitle: 'Gestión completa de pacientes y traslados' },
    '/pacientes': { title: 'Gestión de Pacientes', subtitle: 'Administración de datos de pacientes' },
    '/horarios': { title: 'Planificación de Horarios', subtitle: 'Distribución semanal de traslados por chofer' },
    '/facturacion': { title: 'Facturación', subtitle: 'Gestión de facturas y seguimiento AFIP' },
    '/cobranza': { title: 'Gestión de Cobranza', subtitle: 'Seguimiento de pagos y comisiones' },
    '/presupuesto': { title: 'Control de Presupuesto', subtitle: 'Ingresos vs Egresos mensuales' },
    '/reportes': { title: 'Reportes y Estadísticas', subtitle: 'Informes y análisis del negocio' }
  };

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.updateDate();
    this.updatePageTitle(this.router.url);
    
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  private updateDate() {
    const now = new Date();
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    this.currentDate = `${months[now.getMonth()]} ${now.getFullYear()}`;
  }

  private updatePageTitle(url: string) {
    const path = url.split('?')[0];
    const pageInfo = this.pageTitles[path];
    if (pageInfo) {
      this.pageTitle = pageInfo.title;
      this.pageSubtitle = pageInfo.subtitle;
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  onLogout() {
    this.showUserMenu = false;
    this.authService.signOut();
  }
}
