# Script de PowerShell para configurar la base de datos de Supabase
# Ejecuta este script desde la terminal de PowerShell en VS Code

param(
    [string]$SupabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL,
    [string]$ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY
)

Write-Host "=== Configuración de Base de Datos Supabase ===" -ForegroundColor Green

# Verificar que las variables de entorno estén configuradas
if (-not $SupabaseUrl) {
    Write-Host "Error: NEXT_PUBLIC_SUPABASE_URL no está configurada" -ForegroundColor Red
    Write-Host "Asegúrate de que el archivo .env.local tenga la URL de Supabase"
    exit 1
}

if (-not $ServiceRoleKey) {
    Write-Host "Error: SUPABASE_SERVICE_ROLE_KEY no está configurada" -ForegroundColor Red
    Write-Host "Necesitas agregar SUPABASE_SERVICE_ROLE_KEY a tu archivo .env.local"
    Write-Host "Puedes encontrar esta clave en: https://supabase.com/dashboard/project/_/settings/api"
    exit 1
}

Write-Host "URL de Supabase: $SupabaseUrl" -ForegroundColor Yellow

# Función para ejecutar consultas SQL
function Invoke-SupabaseQuery {
    param(
        [string]$Query,
        [string]$Description
    )
    
    Write-Host "`nEjecutando: $Description" -ForegroundColor Cyan
    
    $headers = @{
        "apikey" = $ServiceRoleKey
        "Authorization" = "Bearer $ServiceRoleKey"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        query = $Query
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body
        Write-Host "✓ Completado exitosamente" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Instrucciones para el usuario
Write-Host "`n=== INSTRUCCIONES ===" -ForegroundColor Yellow
Write-Host "Para ejecutar los scripts SQL, tienes varias opciones:`n"

Write-Host "OPCIÓN 1 - Consola SQL de Supabase (Recomendado):" -ForegroundColor Green
Write-Host "1. Ve a tu dashboard de Supabase: $SupabaseUrl"
Write-Host "2. Navega a SQL Editor"
Write-Host "3. Ejecuta los siguientes archivos en orden:"
Write-Host "   - scripts/01-create-tables.sql"
Write-Host "   - scripts/02-setup-rls.sql"
Write-Host "   - scripts/03-seed-data.sql"
Write-Host "   - scripts/05-improved-triggers.sql"

Write-Host "`nOPCIÓN 2 - Verificar estado actual:" -ForegroundColor Green
Write-Host "1. Ejecuta scripts/verify-and-fix-db.sql en la consola SQL"
Write-Host "2. Revisa los resultados para ver qué falta"

Write-Host "`nOPCIÓN 3 - Si tienes psql instalado:" -ForegroundColor Green
Write-Host "Puedes usar la URL de conexión directa desde .env.local"

Write-Host "`n=== SOLUCIÓN RÁPIDA ===" -ForegroundColor Magenta
Write-Host "Si sigues teniendo problemas, ejecuta este código en la consola SQL de Supabase:"

$quickFix = @"
-- Crear tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'normal',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política básica para inserción
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política básica para lectura
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

-- Política básica para actualización
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
"@

Write-Host $quickFix -ForegroundColor White

Write-Host "`n=== SIGUIENTES PASOS ===" -ForegroundColor Yellow
Write-Host "1. Ejecuta el código de 'SOLUCIÓN RÁPIDA' arriba en la consola SQL"
Write-Host "2. Luego ejecuta los scripts completos para obtener todas las funcionalidades"
Write-Host "3. Reinicia tu aplicación Next.js: pnpm dev"

Write-Host "`nPresiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")