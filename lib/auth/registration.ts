import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export interface RegistrationData {
  email: string
  password: string
  fullName: string
  role: "normal" | "vendor" | "organizer"
}

export interface RegistrationResult {
  success: boolean
  user?: any
  error?: string
}

export async function registerUser(data: RegistrationData): Promise<RegistrationResult> {
  const supabase = getSupabaseBrowserClient()

  try {
    // Step 1: Sign up user with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role,
        },
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return {
        success: false,
        error: getErrorMessage(authError),
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: "No se pudo crear el usuario",
      }
    }

    // Step 2: Wait a moment for triggers to execute
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Step 3: Verify or create profile
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", authData.user.id)
        .single()

      if (!existingProfile) {
        // Profile doesn't exist, create it manually
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          role: data.role,
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
          return {
            success: false,
            error: "Error al crear el perfil de usuario",
          }
        }
      }
    } catch (profileError) {
      console.error("Profile verification error:", profileError)
      // Try to create profile anyway
      const { error: createProfileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        role: data.role,
      })

      if (createProfileError) {
        console.error("Manual profile creation error:", createProfileError)
        return {
          success: false,
          error: "Error al crear el perfil de usuario",
        }
      }
    }

    // Step 4: Create vendor profile if needed
    if (data.role === "vendor") {
      try {
        const { data: existingVendor } = await supabase
          .from("vendors")
          .select("id")
          .eq("user_id", authData.user.id)
          .single()

        if (!existingVendor) {
          const { error: vendorError } = await supabase.from("vendors").insert({
            user_id: authData.user.id,
            business_name: data.fullName || "Mi Negocio",
            description: "Descripción pendiente",
          })

          if (vendorError) {
            console.error("Vendor profile creation error:", vendorError)
            // Don't fail the registration for this, just log
          }
        }
      } catch (vendorError) {
        console.error("Vendor profile verification error:", vendorError)
        // Don't fail the registration for this
      }
    }

    return {
      success: true,
      user: authData.user,
    }

  } catch (error: any) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: error.message || "Error inesperado durante el registro",
    }
  }
}

function getErrorMessage(error: any): string {
  if (error.message?.includes("User already registered")) {
    return "Este correo electrónico ya está registrado"
  }
  if (error.message?.includes("Invalid email")) {
    return "Correo electrónico inválido"
  }
  if (error.message?.includes("Password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres"
  }
  if (error.message?.includes("Signup is disabled")) {
    return "El registro está deshabilitado temporalmente"
  }
  return error.message || "Error al registrar usuario"
}

export function getRedirectPath(role: string): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard"
    case "organizer":
      return "/organizer/dashboard"
    case "vendor":
      return "/setup-vendor"
    case "normal":
    default:
      return "/dashboard"
  }
}