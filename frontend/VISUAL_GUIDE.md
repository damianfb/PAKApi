# PAK Frontend - Guía Visual de la Interfaz

## 📱 Pantallas Principales

### 1. Login Screen

**Ubicación**: `/login`

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                                                 │
│         ┌─────────────────────────┐            │
│         │ PAK - Transporte de     │            │
│         │ Pacientes               │            │
│         │ Iniciar Sesión          │            │
│         ├─────────────────────────┤            │
│         │                         │            │
│         │ Email                   │            │
│         │ [________________]      │            │
│         │                         │            │
│         │ Contraseña              │            │
│         │ [________________]      │            │
│         │                         │            │
│         │  [Iniciar Sesión]       │            │
│         │                         │            │
│         └─────────────────────────┘            │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Características**:
- Fondo con gradiente morado
- Card central con formulario
- Validación de campos
- Loading spinner durante autenticación
- Redirección automática al dashboard

---

### 2. Dashboard Principal

**Ubicación**: `/dashboard`

```
┌──────────────────────────────────────────────────────────────────┐
│ ☰ PAK - Transporte de Pacientes                    👤 user@email │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│ Dashboard                                                          │
│                                                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│ │💰          │ │⏳           │ │🚗           │ │👥           ││
│ │$1,500,000  │ │$350,000     │ │45           │ │87           ││
│ │Total       │ │Pendiente    │ │Viajes Hoy   │ │Pacientes    ││
│ │Facturado   │ │de Cobro     │ │             │ │Activos      ││
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
│                                                                    │
│ ┌─────────────┐                                                   │
│ │👤           │                                                   │
│ │5            │                                                   │
│ │Conductores  │                                                   │
│ │Activos      │                                                   │
│ └─────────────┘                                                   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Características**:
- 5 KPIs principales con gradientes de colores
- Iconos Material Design
- Datos actualizados en tiempo real
- Cards con hover effects

---

### 3. Gestión de Pacientes

**Ubicación**: `/pacientes`

```
┌──────────────────────────────────────────────────────────────────┐
│ ☰ PAK - Transporte de Pacientes                    👤 user@email │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│ Gestión de Pacientes                      [+ Nuevo Paciente]     │
│                                                                    │
│ 🔍 [Buscar paciente_________________]                            │
│                                                                    │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │Nombre Completo│DNI      │Teléfono │Dirección     │Estado│...││
│ ├──────────────────────────────────────────────────────────────┤│
│ │García, Juan   │12345678 │1145678  │Av. XX, CABA  │✓ Activo││
│ │López, María   │87654321 │1198765  │Calle YY, GBA │✓ Activo││
│ │Pérez, Pedro   │11223344 │1156789  │Pasaje ZZ, LP │✓ Activo││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Características**:
- Tabla con paginación
- Búsqueda en tiempo real
- Filtros por obra social, estado
- Botones de acciones (ver, editar)
- Chips de estado (Activo/Inactivo)

---

### 4. Layout Principal

**Estructura**:

```
┌────────────────────────────────────────────────────────────┐
│ Header (AppBar)                                            │
│ ☰ PAK - Transporte de Pacientes         👤 User Menu      │
├─────────┬──────────────────────────────────────────────────┤
│ Sidebar │ Main Content Area                                │
│         │                                                   │
│ 📊 Dash │ ┌─────────────────────────────────────────────┐ │
│ 👥 Pac  │ │                                             │ │
│ 📅 Hor  │ │                                             │ │
│ 📄 Fac  │ │         Component Content                   │ │
│ 💰 Cob  │ │         (Router Outlet)                     │ │
│ 📊 Pre  │ │                                             │ │
│ 📈 Rep  │ │                                             │ │
│         │ └─────────────────────────────────────────────┘ │
│         │                                                   │
└─────────┴───────────────────────────────────────────────────┘
```

**Sidebar Menu**:
- Dashboard 📊
- Pacientes 👥
- Horarios 📅
- Facturación 📄
- Cobranza 💰
- Presupuesto 📊
- Reportes 📈

**Header**:
- Botón menú hamburguesa
- Logo/Título
- Menú de usuario (logout)

---

### 5. Módulos Secundarios

#### Horarios
```
Gestión de Horarios y Viajes
└── Módulo de gestión de horarios y asignación de viajes por conductor

📅 Calendario semanal por chofer
📍 Asignación de viajes
🔔 Alertas de conflictos de horarios
```

#### Facturación
```
Facturación
└── Gestión y generación de facturas

🧾 Generación automática de facturas
🧮 Cálculo de km y montos
📄 Exportación a PDF
```

#### Cobranza
```
Cobranza
└── Gestión de pagos y cobranzas

💳 Facturas pendientes por obra social
✅ Registro de pagos recibidos
⚠️ Alertas de facturas vencidas
```

#### Presupuesto
```
Presupuesto y Finanzas
└── Control de ingresos y egresos

💰 Control de ingresos y egresos mensuales
📊 Dashboard financiero con gráficos
📈 Proyecciones vs real
```

#### Reportes
```
Reportes y Analíticas
└── Reportes y métricas del sistema

📊 Facturación mensual por obra social
🚗 Km recorridos por chofer
💹 Rentabilidad por paciente
```

---

## 🎨 Paleta de Colores

### Primary Color (Material Indigo)
- Base: `#3f51b5`
- Light: `#757de8`
- Dark: `#002984`

### Accent Colors (para KPIs)
```
Purple Gradient:  #667eea → #764ba2  (Total Facturado)
Pink Gradient:    #f093fb → #f5576c  (Pendiente Cobro)
Blue Gradient:    #4facfe → #00f2fe  (Viajes Hoy)
Green Gradient:   #43e97b → #38f9d7  (Pacientes Activos)
Orange Gradient:  #fa709a → #fee140  (Conductores)
```

### Status Colors
- Activo: `#4caf50` (Green)
- Inactivo: `#f44336` (Red)
- Warning: `#ff9800` (Orange)
- Info: `#2196f3` (Blue)

---

## 📐 Responsive Design

### Desktop (>1024px)
- Sidebar: 260px fijo
- Main content: Fluid con max-width
- KPIs: Grid de 3-4 columnas
- Tablas: Todas las columnas visibles

### Tablet (768px - 1024px)
- Sidebar: Colapsable
- Main content: Full width
- KPIs: Grid de 2 columnas
- Tablas: Scroll horizontal

### Mobile (<768px)
- Sidebar: Drawer modal
- Main content: Full width con padding reducido
- KPIs: 1 columna
- Tablas: Modo card o scroll

---

## 🎯 Componentes de Material Design

### Utilizados:
- **MatToolbar**: Header
- **MatSidenav**: Sidebar navigation
- **MatCard**: Cards de KPIs y contenido
- **MatTable**: Tablas de datos
- **MatButton**: Botones de acción
- **MatIcon**: Iconos
- **MatFormField**: Campos de formulario
- **MatInput**: Inputs de texto
- **MatMenu**: Menú de usuario
- **MatChip**: Chips de estado
- **MatProgressSpinner**: Loading states
- **MatSnackBar**: Notificaciones toast

---

## 🚀 Animaciones y Transiciones

### Hover Effects
- Cards: Elevación de sombra
- Botones: Cambio de color
- Links de sidebar: Cambio de fondo

### Loading States
- Spinners en carga de datos
- Skeleton loaders (futuro)
- Progress bars para acciones largas

### Page Transitions
- Fade in al cambiar de ruta
- Slide para modales

---

## ♿ Accesibilidad

- ARIA labels en todos los botones
- Focus visible en elementos interactivos
- Contraste de colores WCAG AA
- Navegación por teclado
- Screen reader friendly

---

## 📱 PWA Features

### Installable
- Botón de instalación en navegador
- Ícono en home screen
- Splash screen personalizada

### Offline Capability
- Service worker activo
- Cacheo de assets estáticos
- Fallback para datos offline

### Push Notifications (Futuro)
- Alertas de viajes
- Recordatorios de facturación
- Notificaciones de cobros

---

## 🔐 Seguridad UI

- Tokens no expuestos en UI
- Sanitización de inputs
- Validación cliente y servidor
- Logout automático por inactividad (futuro)
- Mensajes de error genéricos

---

Esta guía visual proporciona una referencia completa de la interfaz de usuario implementada en el frontend Angular PWA de PAK.
