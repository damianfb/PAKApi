import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface ConfigOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
    selector: 'app-configuracion-view',
    imports: [CommonModule],
    templateUrl: './configuracion-view.component.html',
    styleUrl: './configuracion-view.component.scss'
})
export class ConfiguracionViewComponent implements OnInit {
  configOptions: ConfigOption[] = [
    {
      id: 'obras-sociales',
      title: 'Obras Sociales',
      description: 'Gestiona las obras sociales, precios y convenios',
      icon: 'fa-hospital',
      route: '/configuracion/obras-sociales',
      color: '#3b82f6'
    },
    {
      id: 'conductores',
      title: 'Conductores',
      description: 'Administra los conductores y sus datos',
      icon: 'fa-id-card',
      route: '/configuracion/conductores',
      color: '#10b981'
    },
    {
      id: 'destinos',
      title: 'Destinos',
      description: 'Configura centros de salud y destinos frecuentes',
      icon: 'fa-map-marker-alt',
      route: '/configuracion/destinos',
      color: '#f59e0b'
    },
    {
      id: 'conceptos-presupuesto',
      title: 'Conceptos de Presupuesto',
      description: 'Define gastos e ingresos recurrentes del presupuesto',
      icon: 'fa-list-alt',
      route: '/presupuesto',
      color: '#8b5cf6'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateTo(option: ConfigOption): void {
    this.router.navigate([option.route]);
  }
}
