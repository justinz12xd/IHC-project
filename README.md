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
- `/reset-password` - Restablecer contraseña
- `/contact` - Contacto
- `/terms` y `/privacy` - Términos y privacidad
- `/events` - Lista de eventos disponibles

**Usuarios:**
- `/dashboard` - Dashboard principal
- `/events/[id]` - Detalles de evento
- `/events/[id]/registrar` - Formulario de registro a evento
- `/profile` - Perfil de usuario

**Vendedores:**
- `/vendor/dashboard` - Dashboard de vendedor
- `/vendor/products` - Gestión de productos
- `/vendor/events` - Eventos del vendedor
- `/vendor/profile` - Perfil público
- `/vendor/solicitar-participacion` - Solicitar participación en evento
- `/vendor/asignar-producto` - Asignar productos a eventos
- `/setup-vendor` - Formulario de registro de vendedor (con subida de imágenes)

**Organizadores:**
- `/organizer/dashboard` - Dashboard de organizador
- `/organizer/events` - Gestión de eventos

**Administradores:**
- `/admin/dashboard` - Panel de administración
- `/admin/gestionar-eventos` - Aprobar/rechazar eventos pendientes

**Sistema de Gestión (Multi-Formulario):**
- `/shop` - Sistema con 3 pestañas:
  - Pestaña 1: Compra/Consumo - Formulario de compra de productos
  - Pestaña 2: Contacto/Soporte - Formulario de contacto con adjuntos
  - Pestaña 3: Gestión de Eventos (Admin) - Modificar eventos

## 📋 Formularios Implementados (12 Total)

### 1. **Login** - `/login`
Formulario de inicio de sesión con email y contraseña

### 2. **Registro** - `/register`
Formulario de registro con selección de rol (Usuario, Vendedor, Organizador)

### 3. **Recuperar Contraseña** - `/forgot-password`
Formulario para solicitar restablecimiento de contraseña

### 4. **Restablecer Contraseña** - `/reset-password`
Formulario para crear nueva contraseña

### 5. **Registro de Vendedor** - `/setup-vendor`
Formulario completo con:
- Biografía (50-500 caracteres)
- Historia del negocio (100-1000 caracteres)
- Subida múltiple de imágenes con preview
- Validación de tipos de archivo

### 6. **Solicitud de Participación en Evento** - `/vendor/solicitar-participacion`
Formulario para vendedores:
- Selección de evento (dropdown)
- Checkbox de aceptación de términos
- Comentarios opcionales

### 7. **Asignar Producto a Evento** - `/vendor/asignar-producto`
Formulario con:
- Selección de producto propio
- Selección de evento aprobado
- Precio específico para el evento
- Cantidad disponible con validación de stock

### 8. **Registro a Evento** - `/events/[id]/registrar`
Formulario detallado con:
- Información completa del evento
- Barra de progreso de capacidad
- Checkboxes de políticas y notificaciones
- Validación de cupos disponibles

### 9. **Crear/Editar Evento** - `/organizer/events` (usa event-form.tsx)
Formulario de organizador:
- Información básica del evento
- Fechas y horarios
- Ubicación y capacidad
- Opciones: Guardar Borrador o Publicar

### 10. **Gestionar Eventos (Admin)** - `/admin/gestionar-eventos`
Panel administrativo:
- Ver eventos pendientes
- Aprobar o rechazar con un clic
- Ver detalles completos del organizador

### 11. **Compra de Productos** - `/shop` (Pestaña 1)
Formulario de compra:
- Dropdown de productos con precio y stock
- Contador de cantidad (+/-)
- Método de pago
- Cálculo automático del total

### 12. **Contacto/Soporte** - `/shop` (Pestaña 2)
Formulario de contacto:
- Nombre completo
- Email con validación
- Mensaje (máx. 1000 caracteres)
- Adjuntos opcionales múltiples

### 13. **Gestión de Eventos (Admin)** - `/shop` (Pestaña 3)
Formulario administrativo:
- ID del evento
- Cambiar estado (dropdown: Pendiente, Aprobado, Rechazado, etc.)
- Motivo opcional
- Actualizar capacidad y lugar

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
