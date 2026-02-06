import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Movimiento {
  id: number;
  fecha: Date;
  concepto: string;
  categoria: string;
  ingreso: number;
  egreso: number;
  saldo: number;
}

interface ResumenCategoria {
  categoria: string;
  monto: number;
  porcentaje: number;
}

@Component({
    selector: 'app-presupuesto-view',
    imports: [CommonModule, FormsModule],
    templateUrl: './presupuesto-view.component.html',
    styleUrl: './presupuesto-view.component.scss'
})
// 🔶 MOCK: Pantalla completamente mockeada - No conectada a API
export class PresupuestoViewComponent implements OnInit {
  movimientos = signal<Movimiento[]>([]);
  loading = signal(false);
  
  // Filters
  selectedPeriodo = 'Enero 2025';
  selectedTipo = 'todos';
  selectedCategoria = 'todos';
  
  // 🔶 MOCK: Stats hardcodeados
  ingresosMes = 1845320;
  egresosMes = 987450;
  resultadoMensual = 857870;
  presupuestoAnual = 10300000;
  margenPorcentaje = 46;
  
  periodos = ['Enero 2025', 'Diciembre 2024', 'Noviembre 2024', 'Ver año completo'];
  categorias = ['Sueldos', 'Seguros', 'Combustible', 'Mantenimiento', 'Servicios'];
  
  // 🔶 MOCK: Resumen de egresos hardcodeado
  resumenEgresos: ResumenCategoria[] = [
    { categoria: 'Sueldos Conductores', monto: 450000, porcentaje: 46 },
    { categoria: 'Combustible', monto: 187450, porcentaje: 19 },
    { categoria: 'Seguros Vehículos', monto: 125000, porcentaje: 13 },
    { categoria: 'Mantenimiento', monto: 98000, porcentaje: 10 },
    { categoria: 'Servicios (Luz, Tel)', monto: 67000, porcentaje: 7 },
    { categoria: 'Otros Gastos', monto: 60000, porcentaje: 6 }
  ];

  ngOnInit() {
    this.loadMovimientos();
  }

  loadMovimientos() {
    // 🔶 MOCK: Movimientos hardcodeados
    let saldo = 0;
    this.movimientos.set([
      { id: 1, fecha: new Date('2025-01-03'), concepto: 'Facturación OSECAC', categoria: 'Facturación', ingreso: 322843, egreso: 0, saldo: saldo += 322843 },
      { id: 2, fecha: new Date('2025-01-05'), concepto: 'Sueldos Conductores', categoria: 'Sueldos', ingreso: 0, egreso: 150000, saldo: saldo -= 150000 },
      { id: 3, fecha: new Date('2025-01-07'), concepto: 'Facturación OSMATA', categoria: 'Facturación', ingreso: 215000, egreso: 0, saldo: saldo += 215000 },
      { id: 4, fecha: new Date('2025-01-10'), concepto: 'Combustible', categoria: 'Combustible', ingreso: 0, egreso: 45000, saldo: saldo -= 45000 },
      { id: 5, fecha: new Date('2025-01-12'), concepto: 'Seguro Vehículos', categoria: 'Seguros', ingreso: 0, egreso: 62500, saldo: saldo -= 62500 },
      { id: 6, fecha: new Date('2025-01-15'), concepto: 'Facturación OSPSA', categoria: 'Facturación', ingreso: 178450, egreso: 0, saldo: saldo += 178450 },
      { id: 7, fecha: new Date('2025-01-18'), concepto: 'Mantenimiento Flota', categoria: 'Mantenimiento', ingreso: 0, egreso: 35000, saldo: saldo -= 35000 },
      { id: 8, fecha: new Date('2025-01-20'), concepto: 'Facturación SWISS MEDICAL', categoria: 'Facturación', ingreso: 133590, egreso: 0, saldo: saldo += 133590 },
      { id: 9, fecha: new Date('2025-01-22'), concepto: 'Sueldos Conductores', categoria: 'Sueldos', ingreso: 0, egreso: 150000, saldo: saldo -= 150000 },
      { id: 10, fecha: new Date('2025-01-25'), concepto: 'Servicios (Luz, Internet)', categoria: 'Servicios', ingreso: 0, egreso: 25000, saldo: saldo -= 25000 }
    ]);
  }

  get filteredMovimientos(): Movimiento[] {
    return this.movimientos().filter(m => {
      const matchTipo = this.selectedTipo === 'todos' || 
        (this.selectedTipo === 'ingresos' && m.ingreso > 0) ||
        (this.selectedTipo === 'egresos' && m.egreso > 0);
      
      const matchCategoria = this.selectedCategoria === 'todos' || 
        m.categoria.toLowerCase() === this.selectedCategoria.toLowerCase();
      
      return matchTipo && matchCategoria;
    });
  }

  openNewGastoModal() {
    console.log('Open new gasto modal');
  }

  exportData() {
    console.log('Export data');
  }
}

