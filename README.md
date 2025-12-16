# Plataforma de Gestión de Eventos Agroproductivos

Sistema para la gestión de eventos agroproductivos con múltiples roles de usuario, gestión de productos y sistema de asistencia con QR.

## Características Principales

- **Autenticación Multi-Rol**: Sistema con 4 roles (Usuario Normal, Vendedor, Organizador, Administrador)
- **Gestión de Eventos**: Creación y aprobación de eventos por organizadores
- **Catálogo de Productos**: Vendedores pueden gestionar sus productos
- **Control de Asistencia**: Sistema de códigos QR para registro
- **Internacionalización**: Soporte multiidioma
- **Temas**: Modo claro/oscuro
- **Diseño Responsive**: Interfaz adaptable a dispositivos móviles

## Tecnologías

- **Framework**: Next.js 16 (App Router)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth + SSR
- **UI**: shadcn/ui + Tailwind CSS v4
- **TypeScript**: Tipado completo
- **Formularios**: React Hook Form + Zod
- **QR**: QRCode + jsQR

## Roles de Usuario

### 1. Usuario Normal
- Dashboard con eventos disponibles
- Registro en eventos
- Ver catálogos de vendedores
- Marcar asistencia con QR
- Perfil de usuario

### 2. Vendedor
- Dashboard de vendedor
- Gestión de catálogo de productos
- Inventario por evento
- Perfil público

### 3. Organizador
- Dashboard de organizador
- Crear y gestionar eventos
- Aprobar vendedores
- Escanear QR de asistentes
- Ver lista de asistentes

### 4. Administrador
- Dashboard de administración
- Aprobar/rechazar eventos
- Métricas globales de la plataforma

## Rutas Principales

**Públicas:**
- `/` - Página de inicio
- `/login` - Iniciar sesión
- `/register` - Registro con selección de rol
- `/forgot-password` - Recuperación de contraseña
- `/contact` - Contacto
- `/terms` y `/privacy` - Términos y privacidad

**Usuarios:**
- `/dashboard` - Dashboard principal
- `/events/[id]` - Detalles de evento
- `/profile` - Perfil de usuario

**Vendedores:**
- `/vendor/dashboard` - Dashboard de vendedor
- `/vendor/products` - Gestión de productos
- `/vendor/events` - Eventos del vendedor
- `/vendor/profile` - Perfil público
- `/setup-vendor` - Configuración inicial

**Organizadores:**
- `/organizer/dashboard` - Dashboard de organizador
- `/organizer/events` - Gestión de eventos

**Administradores:**
- `/admin/dashboard` - Panel de administración

## Estructura de la Base de Datos

### Tablas Principales

- **profiles** - Perfiles de usuario con roles
- **vendors** - Información de vendedores
- **events** - Eventos del sistema
- **products** - Catálogo de productos
- **event_vendors** - Relación eventos-vendedores
- **event_registrations** - Registros de asistencia
- **inventory** - Inventario por evento

### Estados de Eventos

- `draft` - Borrador
- `pending_approval` - Pendiente de aprobación
- `approved` - Aprobado y visible
- `rejected` - Rechazado
- `active` - En curso
- `completed` - Finalizado
- `cancelled` - Cancelado

## Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
# o
pnpm install
```

### 2. Configurar variables de entorno

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Configurar base de datos

Ejecuta los scripts SQL desde la carpeta `scripts/` en tu proyecto de Supabase.

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Aplicación disponible en `http://localhost:3000`

## Componentes Principales

### UI Components (shadcn/ui)
Más de 30 componentes base: Button, Card, Dialog, Form, Input, Select, Table, Toast, etc.

### Componentes Personalizados
- **auth-status** - Estado de autenticación
- **event-card** - Tarjeta de evento
- **event-form** - Formulario de eventos
- **product-card/form** - Gestión de productos
- **qr-code-display/scanner** - Sistema QR
- **theme-toggle** - Cambio de tema
- **language-toggle** - Cambio de idioma
- **command-palette** - Paleta de comandos (Cmd+K)
- **breadcrumbs** - Navegación por migas
- **dashboard-nav** - Navegación de dashboard

## Características de Diseño

### Accesibilidad
- Contraste de colores WCAG AA
- Labels ARIA
- Navegación por teclado
- Mensajes de estado claros

### Responsive Design
- Mobile-first approach
- Breakpoints adaptables
- Componentes optimizados para móviles

### Internacionalización
- Sistema de idiomas
- Context para traducciones
- Fácil extensión de idiomas

## Seguridad

- Row Level Security (RLS)
- Autenticación SSR con Supabase
- Middleware de protección de rutas
- Validación de roles
