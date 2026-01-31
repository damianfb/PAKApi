# PAK - Transporte de Pacientes (Frontend)

Progressive Web App (PWA) desarrollada con Angular 17+ para la gestión de transporte especializado de pacientes con discapacidad.

## Características

- ✅ **Angular 17+** con Standalone Components
- ✅ **PWA** con Service Workers y soporte offline
- ✅ **Angular Material** para UI components
- ✅ **Responsive Design** Mobile-First
- ✅ **Autenticación JWT** con Supabase
- ✅ **State Management** con Signals
- ✅ **Lazy Loading** por módulos
- ✅ **HTTP Interceptors** para autenticación
- ✅ **TypeScript** tipado estricto

## Módulos Funcionales

### 1. Dashboard
- KPIs principales: Total facturado, pendiente de cobro, viajes del día
- Vista general del estado del sistema
- Acceso rápido a funcionalidades clave

### 2. Gestión de Pacientes
- CRUD completo de pacientes
- Búsqueda y filtrado por obra social, nombre, DNI
- Vista de detalle con historial de facturación
- Gestión de servicios por paciente

### 3. Gestión de Horarios/Viajes
- Calendario semanal por chofer
- Asignación de viajes
- Alertas de conflictos de horarios

### 4. Facturación
- Generación automática de facturas
- Cálculo de km y montos
- Exportación a PDF

### 5. Cobranza
- Dashboard de facturas pendientes
- Registro de pagos
- Alertas de facturas vencidas

### 6. Presupuesto/Finanzas
- Control de ingresos y egresos
- Dashboard financiero con gráficos
- Proyecciones vs real

### 7. Reportes
- Facturación mensual por obra social
- Km recorridos por chofer
- Rentabilidad por paciente

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Funcionalidades core
│   │   ├── auth/               # Servicios de autenticación
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   └── services/           # Servicios base (API, Supabase)
│   ├── shared/                  # Recursos compartidos
│   │   ├── components/         # Componentes reutilizables
│   │   ├── directives/         # Directivas personalizadas
│   │   ├── pipes/              # Pipes personalizados
│   │   └── models/             # Interfaces y modelos
│   ├── features/                # Módulos funcionales
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── pacientes/          # Gestión de pacientes
│   │   ├── horarios/           # Gestión de horarios
│   │   ├── facturacion/        # Facturación
│   │   ├── cobranza/           # Cobranza
│   │   ├── presupuesto/        # Presupuesto
│   │   └── reportes/           # Reportes
│   └── layout/                  # Layout components
│       ├── header/             # Header con menú de usuario
│       ├── sidebar/            # Sidebar de navegación
│       └── main-layout/        # Layout principal
├── environments/                # Configuraciones de entorno
└── assets/                      # Assets estáticos
```

## Configuración

### 1. Variables de Entorno

Editar `src/environments/environment.ts` y `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-anon-key',
  apiUrl: 'https://your-project.supabase.co/functions/v1'
};
```

### 2. Instalación

```bash
cd frontend
npm install
```

### 3. Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

### 4. Build de Producción

```bash
npm run build
```

Los archivos de producción estarán en `dist/frontend`

## Integración con Backend

El frontend consume la API REST del backend (Edge Functions de Supabase):

- **Base URL**: `https://your-project.supabase.co/functions/v1`
- **Autenticación**: JWT Bearer token en header `Authorization`
- **Endpoints disponibles**:
  - `/pacientes` - CRUD de pacientes
  - `/conductores` - CRUD de conductores
  - `/obras-sociales` - CRUD de obras sociales
  - `/destinos` - CRUD de destinos
  - `/horarios-traslados` - CRUD de horarios
  - `/facturas` - CRUD de facturas
  - `/traslados-generar-periodo` - Generación automática de traslados
  - `/facturas-generar` - Generación automática de facturas
  - `/reportes/*` - Endpoints de reportes y dashboards

Ver documentación completa de la API en `/FASE7A_API_DOCUMENTATION.md`

## PWA - Capacidades Offline

La aplicación es una PWA completa con soporte offline:

- **Service Worker**: Cacheo de assets y llamadas API
- **Manifest**: Instalable en dispositivos móviles y desktop
- **Offline First**: Funcionalidad básica disponible sin conexión
- **Sync en Background**: Sincronización automática cuando se recupera conexión

## Tests

```bash
# Tests unitarios
npm test

# Tests E2E
npm run e2e
```

## Despliegue

### Opción 1: Vercel

```bash
npm install -g vercel
vercel
```

### Opción 2: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Opción 3: Firebase Hosting

```bash
npm install -g firebase-tools
firebase init
firebase deploy
```

## Seguridad

- Autenticación JWT con Supabase Auth
- Route guards para protección de rutas
- HTTP Interceptors para inyección de tokens
- HTTPS obligatorio en producción
- Sanitización de inputs
- XSS protection con Angular

## Mejores Prácticas Implementadas

- Standalone Components (Angular 17+)
- Signals para state management
- Lazy Loading de módulos
- OnPush change detection strategy (donde aplique)
- Strong typing con TypeScript
- Responsive design mobile-first
- Accesibilidad (a11y) con ARIA labels

## Soporte de Navegadores

- Chrome (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Edge (últimas 2 versiones)
- Chrome Mobile
- Safari Mobile

## Licencia

Privado - Todos los derechos reservados

## Soporte

Para soporte técnico, contactar al equipo de desarrollo.
