# PAK - Sistema de Gestión de Transporte de Pacientes

Sistema completo de gestión para empresa de transporte especializado de pacientes con discapacidad, compuesto por backend API (Supabase Edge Functions) y frontend PWA (Angular 17+).

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Backend API](#backend-api)
- [Frontend PWA](#frontend-pwa)
- [Instalación y Configuración](#instalación-y-configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Documentación](#documentación)

## 📖 Descripción General

PAKApi es un sistema integral para gestionar:

- **Pacientes (Cartera)**: Gestión completa de beneficiarios con datos personales, obras sociales, servicios y facturación
- **Conductores**: Registro de choferes con licencias y liquidaciones
- **Horarios y Viajes**: Planificación y seguimiento de traslados diarios
- **Facturación**: Generación automática de facturas por servicios prestados
- **Cobranza**: Control de pagos de obras sociales
- **Presupuesto**: Gestión de ingresos y gastos operativos
- **Reportes**: Analytics y métricas del negocio

## 🏗️ Arquitectura del Sistema

### Backend
- **Base de Datos**: PostgreSQL en Supabase
- **API**: Edge Functions (TypeScript/Deno) en Supabase
- **Autenticación**: Supabase Auth con JWT
- **Seguridad**: Row Level Security (RLS) policies

### Frontend
- **Framework**: Angular 17+ con Standalone Components
- **UI**: Angular Material
- **PWA**: Service Workers para funcionalidad offline
- **State Management**: Angular Signals
- **Estilos**: SCSS con responsive design

## 🔧 Backend API

### Características

- ✅ 12 Edge Functions implementadas
- ✅ 61 endpoints REST (55 CRUD + 6 reportes)
- ✅ Autenticación JWT
- ✅ CORS habilitado
- ✅ Paginación y filtros
- ✅ Validaciones y manejo de errores
- ✅ RLS policies en base de datos

### Endpoints Principales

```
/pacientes              - CRUD de pacientes
/conductores            - CRUD de conductores
/obras-sociales         - CRUD de obras sociales
/destinos               - CRUD de destinos
/horarios-traslados     - CRUD de horarios
/facturas               - CRUD de facturas
/traslados-mensuales    - CRUD de traslados mensuales
/cobranzas              - CRUD de cobranzas
/recibos                - CRUD de recibos
/gastos-operativos      - CRUD de gastos
/liquidaciones          - CRUD de liquidaciones
/reportes               - Reportes y dashboards
```

Ver documentación completa en:
- [FASE7A_API_DOCUMENTATION.md](FASE7A_API_DOCUMENTATION.md)
- [FASE8_COMPLETION_REPORT.md](FASE8_COMPLETION_REPORT.md)

## 💻 Frontend PWA

### Características

- ✅ Angular 17+ con Standalone Components
- ✅ PWA con capacidades offline
- ✅ Angular Material UI
- ✅ Responsive Design (Mobile-First)
- ✅ Lazy Loading de módulos
- ✅ Guards y Interceptors
- ✅ State management con Signals

### Módulos

1. **Dashboard**: Vista general con KPIs
2. **Pacientes**: Gestión completa de pacientes
3. **Horarios**: Calendario y asignación de viajes
4. **Facturación**: Generación y gestión de facturas
5. **Cobranza**: Control de pagos pendientes
6. **Presupuesto**: Dashboard financiero
7. **Reportes**: Analytics y métricas

Ver documentación en [frontend/README.md](frontend/README.md)

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ y npm
- Cuenta en Supabase
- Git

### 1. Clonar el Repositorio

```bash
git clone https://github.com/damianfb/PAKApi.git
cd PAKApi
```

### 2. Configurar Backend (Supabase)

#### a. Crear Proyecto en Supabase

1. Ir a https://supabase.com y crear un nuevo proyecto
2. Anotar la URL y las claves (anon key y service key)

#### b. Aplicar Migraciones

```bash
cd supabase

# Aplicar migraciones en orden
# Puedes usar la interfaz de Supabase SQL Editor o Supabase CLI
```

Migraciones a aplicar en orden:
1. `00001_create_base_tables.sql`
2. `00002_seed_initial_data.sql`
3. `00003_create_fase2_tables.sql`
4. `00004_create_fase3_tables.sql`
5. `00005_create_fase4_tables.sql`
6. `00006_create_fase5_tables.sql`
7. `00007_create_fase6_tables.sql`
8. `00008_create_fase7_reporting_views.sql`

#### c. Desplegar Edge Functions

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref your-project-ref

# Deploy todas las funciones
cd supabase/functions
supabase functions deploy
```

### 3. Configurar Frontend

#### a. Instalar Dependencias

```bash
cd frontend
npm install
```

#### b. Configurar Variables de Entorno

Editar `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-anon-key',
  apiUrl: 'https://your-project.supabase.co/functions/v1'
};
```

Editar `frontend/src/environments/environment.prod.ts` con los valores de producción.

#### c. Ejecutar en Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

#### d. Build de Producción

```bash
npm run build
```

Los archivos estarán en `frontend/dist/frontend`

## 📱 Uso

### Acceso al Sistema

1. **Login**: Usar credenciales de Supabase Auth
2. **Dashboard**: Vista general del sistema
3. **Navegación**: Usar el menú lateral para acceder a cada módulo

### Funcionalidades Principales

#### Gestión de Pacientes
- Agregar nuevo paciente con datos completos
- Asignar obra social y destinos
- Configurar servicios (escuela, terapias, etc.)
- Ver historial de facturación

#### Gestión de Horarios
- Crear horarios por conductor
- Asignar viajes programados
- Registrar viajes realizados
- Ver alertas de conflictos

#### Facturación
- Generar facturas automáticamente por período
- Revisar y editar facturas
- Exportar a PDF
- Ver estado de facturación

#### Cobranza
- Ver facturas pendientes
- Registrar pagos recibidos
- Conciliar cobros
- Ver alertas de vencimientos

#### Reportes
- Facturación mensual por obra social
- Km recorridos por conductor
- Rentabilidad mensual
- Pacientes por obra social

## 📂 Estructura del Proyecto

```
PAKApi/
├── supabase/                   # Backend
│   ├── migrations/            # Migraciones de BD
│   └── functions/             # Edge Functions
│       ├── pacientes/
│       ├── conductores/
│       ├── facturas/
│       ├── reportes/
│       └── ...
│
├── frontend/                   # Frontend PWA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/         # Auth, Guards, Interceptors
│   │   │   ├── shared/       # Models, Components compartidos
│   │   │   ├── features/     # Módulos funcionales
│   │   │   └── layout/       # Layout components
│   │   ├── environments/
│   │   └── assets/
│   └── README.md
│
├── tests/                      # Tests E2E
├── README.md                  # Este archivo
└── FRONTEND_SETUP_GUIDE.md   # Esta guía
```

## 📚 Documentación

### Backend
- [README.md](README.md) - Documentación general
- [FASE7A_API_DOCUMENTATION.md](FASE7A_API_DOCUMENTATION.md) - API REST endpoints
- [FASE8_COMPLETION_REPORT.md](FASE8_COMPLETION_REPORT.md) - Reporte de implementación
- [FASE8_SECURITY_GUIDE.md](FASE8_SECURITY_GUIDE.md) - Guía de seguridad
- [FASE8_DEPLOYMENT_GUIDE.md](FASE8_DEPLOYMENT_GUIDE.md) - Guía de despliegue

### Frontend
- [frontend/README.md](frontend/README.md) - Documentación del frontend
- Este documento - Guía de configuración completa

### Tests
- [tests/README.md](tests/README.md) - Tests E2E

## 🔒 Seguridad

- Autenticación JWT con Supabase Auth
- Row Level Security (RLS) en base de datos
- HTTPS obligatorio en producción
- Validación de inputs
- Sanitización de datos
- XSS protection
- CORS configurado

## 🚢 Despliegue

### Backend
El backend ya está desplegado en Supabase. Ver [FASE8_DEPLOYMENT_GUIDE.md](FASE8_DEPLOYMENT_GUIDE.md)

### Frontend

#### Opción 1: Vercel
```bash
npm install -g vercel
cd frontend
vercel
```

#### Opción 2: Netlify
```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod
```

#### Opción 3: Firebase Hosting
```bash
npm install -g firebase-tools
cd frontend
firebase init
firebase deploy
```

## 🐛 Solución de Problemas

### Error de CORS
Verificar que las Edge Functions tengan CORS habilitado. Ver `supabase/functions/_shared/cors.ts`

### Error de Autenticación
1. Verificar que las credenciales en `environment.ts` sean correctas
2. Verificar que el usuario existe en Supabase Auth
3. Revisar las RLS policies en la base de datos

### Error al Cargar Datos
1. Verificar que las migraciones estén aplicadas
2. Verificar que haya datos seed en las tablas
3. Revisar la consola del navegador para errores

## 📞 Soporte

Para soporte técnico o consultas:
- Issues: https://github.com/damianfb/PAKApi/issues
- Email: soporte@pakapi.com (configurar)

## 📄 Licencia

Privado - Todos los derechos reservados

## 👥 Autores

- Equipo de desarrollo PAKApi
- Damián ([@damianfb](https://github.com/damianfb))

---

**Última actualización**: Enero 2026
