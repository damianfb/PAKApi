# PAK - Quick Start Guide

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- npm 10+
- Cuenta en Supabase

### 1. Configurar Backend (Ya implementado)

El backend ya está implementado en Supabase con:
- ✅ 8 migraciones de base de datos
- ✅ 12 Edge Functions
- ✅ 61 endpoints REST
- ✅ RLS policies

Ver [FASE8_DEPLOYMENT_GUIDE.md](FASE8_DEPLOYMENT_GUIDE.md) para detalles.

### 2. Configurar Frontend

```bash
# Clonar repositorio
git clone https://github.com/damianfb/PAKApi.git
cd PAKApi/frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar: src/environments/environment.ts
# Agregar:
# - supabaseUrl: 'https://your-project.supabase.co'
# - supabaseKey: 'your-anon-key'

# Ejecutar en desarrollo
npm start

# Abrir navegador en http://localhost:4200
```

### 3. Login

Usar credenciales de Supabase Auth:
```
Email: tu-email@ejemplo.com
Password: tu-password
```

### 4. Explorar

- **Dashboard**: Vista general con KPIs
- **Pacientes**: Gestión de beneficiarios
- **Horarios**: Planificación de viajes
- **Facturación**: Gestión de facturas
- **Cobranza**: Control de pagos
- **Presupuesto**: Dashboard financiero
- **Reportes**: Analytics

## 📚 Documentación Completa

- [README.md](README.md) - Información general
- [frontend/README.md](frontend/README.md) - Documentación del frontend
- [FRONTEND_SETUP_GUIDE.md](FRONTEND_SETUP_GUIDE.md) - Guía completa de configuración
- [FASE9_FRONTEND_COMPLETION_REPORT.md](FASE9_FRONTEND_COMPLETION_REPORT.md) - Reporte de implementación

## 🏗️ Arquitectura

```
┌──────────────┐
│   Angular    │
│   Frontend   │ ←─── PWA (Offline capable)
│   (Port 4200)│
└──────┬───────┘
       │ HTTPS/JWT
       ↓
┌──────────────┐
│   Supabase   │
│ Edge Functions│ ←─── REST API (61 endpoints)
│              │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  PostgreSQL  │ ←─── Database with RLS
│   (Supabase) │
└──────────────┘
```

## 🔧 Scripts Útiles

```bash
# Frontend
cd frontend
npm start              # Desarrollo
npm run build          # Producción
npm test               # Tests (pendiente)

# Backend (Supabase CLI)
supabase functions deploy    # Deploy Edge Functions
supabase db push             # Aplicar migraciones
```

## 🌐 Despliegue

### Frontend (Vercel)
```bash
cd frontend
vercel
```

### Backend
Ya desplegado en Supabase. Ver guía de deployment.

## 💡 Tips

1. **Mock Data**: El dashboard usa datos mock si falla la API
2. **Offline**: PWA cachea assets automáticamente
3. **Responsive**: Probado en desktop, tablet y mobile
4. **Guards**: Todas las rutas protegidas con autenticación

## 🐛 Problemas Comunes

### Error de CORS
Verificar Edge Functions tienen CORS habilitado.

### Error de Auth
Verificar credenciales en `environment.ts`.

### Build Failures
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 Soporte

- Issues: https://github.com/damianfb/PAKApi/issues
- Docs: Ver archivos FASE*.md

---

**¡Listo para usar!** 🎉
