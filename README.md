# Plataforma de Gestión de Eventos Agroproductivos

Sistema completo para la gestión de eventos agroproductivos con múltiples roles de usuario, gestión de inventario, sistema de QR para asistencia y reportes detallados.

## Características Principales

- **Autenticación Multi-Rol**: Sistema de autenticación con 4 roles diferentes (Usuario Normal, Vendedor, Organizador, Administrador)
- **Gestión de Eventos**: Creación, aprobación y gestión completa de eventos
- **Catálogo de Productos**: Sistema para vendedores con productos, historias y beneficios
- **Control de Asistencia**: Sistema de códigos QR para registro de asistencia
- **Gestión de Inventario**: Control de inventario por evento con precios específicos
- **Reportes y Métricas**: Dashboards con estadísticas y exportación de datos
- **Cumplimiento ISO**: Diseño siguiendo normas ISO 9241-210 y 9241-11 para usabilidad y accesibilidad

## Tecnologías

- **Framework**: Next.js 16 con App Router
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **UI**: shadcn/ui + Tailwind CSS v4
- **TypeScript**: Tipado completo
- **QR Codes**: react-qr-code y react-qr-scanner

## Roles de Usuario

### 1. Usuario Normal
Asistentes que se registran en eventos y exploran productos.

**Funcionalidades:**
- Ver eventos próximos y disponibles
- Registrarse en eventos
- Ver catálogos de vendedores y productos
- Marcar asistencia con código QR
- Historial de eventos asistidos

**Rutas:**
- `/dashboard` - Dashboard principal
- `/events/[id]` - Detalles de evento
- `/events/[id]/qr` - Código QR para asistencia
- `/profile` - Perfil de usuario

### 2. Vendedor
Productores que venden en eventos y gestionan su catálogo.

**Funcionalidades:**
- Crear y gestionar catálogo de productos
- Gestionar inventario por evento
- Establecer precios específicos por evento
- Registrar asistencia con QR
- Ver estadísticas de productos y eventos
- Perfil público con historia y objetivos

**Rutas:**
- `/vendor/dashboard` - Dashboard de vendedor
- `/vendor/products/new` - Crear nuevo producto
- `/vendor/profile` - Perfil público de vendedor
- `/vendor/events/[id]/inventory` - Gestionar inventario del evento
- `/vendor/events/[id]/qr` - Código QR para asistencia

### 3. Organizador
Usuarios que crean y gestionan eventos.

**Funcionalidades:**
- Crear eventos (borradores y publicados)
- Gestionar logística de eventos
- Aprobar/rechazar vendedores para eventos
- Escanear códigos QR de asistentes
- Ver lista de asistentes registrados
- Generar reportes y exportar datos (CSV)
- Emitir credenciales digitales

**Rutas:**
- `/organizer/dashboard` - Dashboard de organizador
- `/organizer/events/new` - Crear nuevo evento
- `/organizer/events/[id]` - Gestionar evento específico
- `/organizer/events/[id]/scan` - Escanear QR de asistentes

### 4. Administrador
Supervisores que validan y aprueban eventos.

**Funcionalidades:**
- Aprobar o rechazar eventos pendientes
- Proporcionar feedback a organizadores
- Validación por etapas (datos básicos, documentación)
- Ver métricas globales de la plataforma
- Estadísticas de eventos aprobados/rechazados

**Rutas:**
- `/admin/dashboard` - Dashboard de administrador

## Rutas Públicas

- `/` - Página de inicio con información de la plataforma
- `/login` - Iniciar sesión
- `/register` - Registrarse (con selección de rol)
- `/setup-vendor` - Configuración inicial para vendedores

## Estructura de la Base de Datos

### Tablas Principales

1. **profiles** - Perfiles de usuario con roles
2. **vendors** - Información adicional de vendedores
3. **events** - Eventos con toda su información
4. **products** - Catálogo de productos de vendedores
5. **event_vendors** - Relación entre eventos y vendedores aprobados
6. **event_registrations** - Registros de usuarios a eventos
7. **inventory** - Inventario de productos por evento
8. **sales** - Registro de ventas
9. **vendor_event_history** - Historial de participación de vendedores

### Estados de Eventos

- `draft` - Borrador (no visible públicamente)
- `pending_approval` - Pendiente de aprobación por admin
- `approved` - Aprobado y visible
- `rejected` - Rechazado por admin
- `active` - Evento en curso
- `completed` - Evento finalizado
- `cancelled` - Evento cancelado

## Instalación y Configuración

### 1. Clonar el repositorio

\`\`\`bash
git clone <repository-url>
cd event-management-platform
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno

Las variables de Supabase ya están configuradas en el proyecto de Vercel.

### 4. Ejecutar scripts de base de datos

Ejecuta los scripts SQL en orden desde la carpeta `scripts/`:

1. `01-create-tables.sql` - Crea todas las tablas
2. `02-setup-rls.sql` - Configura Row Level Security
3. `03-seed-data.sql` - Datos de ejemplo (opcional)
4. `04-create-profile-trigger.sql` - Trigger para crear perfiles automáticamente

### 5. Ejecutar en desarrollo

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

## Flujo de Trabajo

### Para Usuarios Normales
1. Registrarse con rol "Usuario Normal"
2. Explorar eventos disponibles en el dashboard
3. Registrarse en eventos de interés
4. Ver detalles de vendedores y productos
5. Marcar asistencia con QR el día del evento

### Para Vendedores
1. Registrarse con rol "Vendedor"
2. Completar perfil de vendedor (historia, objetivos)
3. Crear catálogo de productos
4. Esperar aprobación para eventos
5. Configurar inventario y precios por evento
6. Marcar asistencia con QR el día del evento

### Para Organizadores
1. Registrarse con rol "Organizador"
2. Crear evento (borrador o enviar para aprobación)
3. Esperar aprobación del administrador
4. Aprobar vendedores para el evento
5. Gestionar asistentes y escanear QR
6. Generar reportes post-evento

### Para Administradores
1. Acceder al panel de administración
2. Revisar eventos pendientes de aprobación
3. Validar datos básicos y documentación
4. Aprobar o rechazar con feedback
5. Monitorear métricas globales

## Cumplimiento de Normas ISO

La plataforma cumple con:

- **ISO 9241-210**: Diseño centrado en el usuario
- **ISO 9241-11**: Usabilidad (efectividad, eficiencia, satisfacción)

### Características de Accesibilidad

- Contraste de colores WCAG AA
- Labels ARIA descriptivos
- Navegación por teclado
- Mensajes de estado claros
- Feedback visual inmediato
- Textos legibles (mínimo 16px)
- Formularios con validación clara

## Seguridad

- Row Level Security (RLS) en todas las tablas
- Autenticación con Supabase Auth
- Protección de rutas con middleware
- Validación de roles en servidor
- Tokens JWT seguros

## Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.
