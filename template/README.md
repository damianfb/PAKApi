# PAK TRASLADOS - Prototipo HTML/CSS

Prototipo estático completo del sistema de gestión de traslados de pacientes con discapacidad para PAK (Prestador de servicios de transporte sanitario).

## 📋 Descripción del Negocio

PAK TRASLADOS es un sistema para la gestión integral de:
- **Servicio principal**: Transporte de pacientes con discapacidad desde domicilios a escuelas especiales, centros de terapias (C.E.T.), tratamientos e hidroterapia
- **Clientes**: Obras Sociales (OSECAC, OSMATA, OSPSA, PASTELEROS, APM, SWISS MEDICAL, etc.)
- **Facturación**: Por kilómetro recorrido con valores diferenciados:
  - Con Dependencia: $833.79/km
  - Sin Dependencia: $617.62/km
- **Personal**: 5 choferes (RUBEN, MARCOS, DAMIAN, LUIS, LEO)

## 🚀 Estructura del Proyecto

```
/
├── index.html              # Dashboard principal
├── css/
│   └── styles.css         # Sistema de diseño completo
├── js/
│   └── app.js             # Interactividad básica
└── pages/
    ├── cartera.html       # Gestión de pacientes
    ├── horarios.html      # Planificación semanal
    ├── facturacion.html   # Facturación y AFIP
    ├── cobranza.html      # Gestión de cobranzas
    ├── presupuesto.html   # Control financiero
    └── reportes.html      # Reportes y estadísticas
```

## 📄 Páginas Implementadas

### 1. Dashboard (index.html)
- **Métricas principales**: Pacientes activos, facturación mensual, cobranzas pendientes, km recorridos
- **Distribución por Obra Social**: Tabla con porcentajes y montos
- **Accesos rápidos**: Botones de navegación a módulos principales
- **Actividad reciente**: Timeline de últimas acciones
- **Top 10 pacientes**: Ranking por liquidación mensual

### 2. Cartera de Pacientes (cartera.html)
- **Tabla completa**: N°, Apellido/Nombre, DNI, Obra Social, Teléfono, Domicilio, Km/día, Dependencia, Monto
- **Filtros**: Búsqueda, Obra Social, Dependencia, Estado
- **Datos reales**: 15 pacientes con información completa
- **Estadísticas**: Totales de pacientes, km, facturación estimada

### 3. Horarios (horarios.html)
- **Vista semanal**: Lunes a Viernes
- **5 columnas por chofer**: RUBEN, MARCOS, DAMIAN, LUIS, LEO
- **Franjas horarias**: 7:00 a 20:00
- **Cards de traslados**: Paciente, hora, destino y ubicación
- **Resumen por chofer**: Estadísticas de carga de trabajo

### 4. Facturación (facturacion.html)
- **Lista de facturas**: N°, CUIT, Obra Social, Fecha, Importe, CAE, Estado
- **Datos reales**: Facturas 0004-00001761 hasta 0004-00001770
- **Estados**: Emitida, Pendiente AFIP
- **Resumen por OS**: Distribución de facturación
- **Total facturado**: $1.845.320,19

### 5. Cobranza (cobranza.html)
- **Estado de pagos**: Factura, Pagado, Saldo, Fecha pago, Recibo
- **Comisiones 3%**: Cálculo automático sobre cobros
- **Estados**: Pagado, Pendiente, Pago Parcial, Vencido
- **Alertas**: Facturas vencidas con más de 60 días
- **Resumen por OS**: Tasa de cobro por obra social

### 6. Presupuesto (presupuesto.html)
- **Ingresos vs Egresos**: Balance mensual
- **Detalle de movimientos**: Fecha, Concepto, Categoría, Montos
- **Distribución de gastos**: Por categoría (Sueldos 88%, Seguros, Combustible, etc.)
- **Evolución mensual**: Comparativa histórica
- **Resultado**: Margen del 46%

### 7. Reportes (reportes.html)
- **6 tipos de reportes**: Liquidación, Obra Social, Choferes, Cobranzas, Balance, Kilómetros
- **Estadísticas del período**: 8 indicadores clave
- **Top rankings**: Obras sociales y pacientes
- **Alertas y recomendaciones**: Sistema de avisos inteligente

## 🎨 Sistema de Diseño

### Colores
- **Primary**: #2563eb (Azul)
- **Secondary**: #10b981 (Verde)
- **Warning**: #f59e0b (Amarillo)
- **Danger**: #ef4444 (Rojo)
- **Sidebar**: #1e293b (Oscuro)

### Tipografía
- **Fuente**: Inter (Google Fonts)
- Tamaños: 0.75rem - 2rem
- Pesos: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### Componentes
- Cards con sombras sutiles
- Badges de estado con colores semánticos
- Tablas con hover interactivo
- Botones con estados (primary, secondary, success)
- Filtros y formularios estilizados
- Navegación lateral fija

## 📊 Datos de Ejemplo Incluidos

### Pacientes (15 registrados)
- ALANIS TOMAS SEBASTIAN (DNI 55284684, OSMATA)
- CONSALVO ANTONINI ABEL (DNI 47352009, OSECAC)
- RODRIGUEZ MARIA SOL, MARTINEZ JUAN PABLO, FERNANDEZ LUCAS GABRIEL, etc.

### Facturas (10 facturas)
- Rango: 0004-00001761 a 0004-00001770
- Monto total: $1.845.320,19
- Con CAE de AFIP y fechas de vencimiento

### Choferes (5 activos)
- RUBEN: 8 pacientes, 24 viajes/día, 156 km/día
- MARCOS: 9 pacientes, 27 viajes/día, 178 km/día
- DAMIAN: 10 pacientes, 30 viajes/día, 195 km/día
- LUIS: 8 pacientes, 24 viajes/día, 145 km/día
- LEO: 7 pacientes, 21 viajes/día, 110 km/día

## 🔧 Características Técnicas

- ✅ HTML5 semántico
- ✅ CSS3 moderno con variables CSS
- ✅ JavaScript vanilla (sin dependencias)
- ✅ Responsive design (Desktop first)
- ✅ Navegación funcional entre páginas
- ✅ Font Awesome para iconos (CDN)
- ✅ Google Fonts (Inter)
- ✅ Filtros de tabla interactivos
- ✅ Sin frameworks externos

## 🌐 Cómo Visualizar

### Opción 1: Servidor Local (Recomendado)

```bash
cd /home/runner/work/PAKCopilot/PAKCopilot
python3 -m http.server 8080
```

Luego abrir: `http://localhost:8080/index.html`

### Opción 2: Directamente en el Navegador

Abrir cualquier archivo HTML directamente. La navegación entre páginas funcionará correctamente.

## 📱 Diseño Responsive

El prototipo se adapta a diferentes tamaños de pantalla:

- **Desktop**: ≥1024px (diseño completo con sidebar fijo)
- **Tablet**: 768px - 1024px (ajustes de layout)
- **Mobile**: <768px (sidebar responsive, tablas con scroll horizontal)

## 🎯 Reglas de Negocio Implementadas

### Cálculo de Liquidación
```
Monto = Km/día × Días asistidos × Valor KM

Valores por kilómetro:
- Sin Dependencia: $617.62
- Con Dependencia: $833.79
```

### Comisiones
- 3% sobre el monto cobrado
- Aplicado a cada pago recibido

### Estados de Facturas
- **Emitida**: Con CAE de AFIP
- **Pendiente AFIP**: Requiere obtener CAE
- **Anulada**: Factura cancelada

### Estados de Cobranza
- **Pagado**: Cobro completo
- **Pendiente**: Sin pago recibido
- **Pago Parcial**: Cobro parcial del monto
- **Vencido**: Más de 60 días sin cobrar

## 🔮 Próximos Pasos

Este prototipo servirá como base para:

1. **Validación con stakeholders** del modelo de datos y UX
2. **Refinamiento** de casos de uso y flujos
3. **Desarrollo de backend** con base de datos
4. **Implementación de APIs** REST
5. **Integración con AFIP** para facturación electrónica
6. **Sistema de autenticación** y permisos
7. **Reportes exportables** (PDF, Excel)

## 📝 Notas Técnicas

- No requiere instalación de dependencias
- Compatible con navegadores modernos (Chrome, Firefox, Safari, Edge)
- Código limpio y bien comentado
- Fácil de modificar y extender
- Preparado para conversión a aplicación real

## 👥 Autor

Desarrollado para **PAK TRASLADOS** - Sistema de gestión de traslados de pacientes

---

**Versión**: 2.0 - Prototipo Completo  
**Fecha**: Enero 2025  
**Tecnologías**: HTML5, CSS3, JavaScript ES6
