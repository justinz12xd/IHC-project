"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Language = "es" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.events": "Eventos",
    "nav.vendors": "Vendedores",
    "nav.organizers": "Organizadores",
    "nav.login": "Iniciar Sesión",
    "nav.register": "Registrarse",
    "nav.profile": "Mi Perfil",
    "nav.logout": "Cerrar Sesión",
    "nav.admin": "Panel Admin",
    "nav.search": "Buscar...",
    
    // Home Page
    "home.title": "Plataforma de Gestión de Eventos Agroproductivos",
    "home.subtitle": "Conecta productores, organizadores y asistentes en un solo lugar. Gestiona eventos, productos y ventas de manera eficiente.",
    "home.startNow": "Comenzar Ahora",
    "home.login": "Iniciar Sesión",
    "home.features": "Características",
    "home.roles": "Roles y Funcionalidades",
    "home.rolesSubtitle": "La plataforma ofrece diferentes experiencias según tu rol",
    "home.ready": "¿Listo para comenzar?",
    "home.readyText": "Únete a nuestra plataforma y comienza a gestionar eventos agroproductivos de manera profesional",
    "home.createAccount": "Crear Cuenta",
    "home.haveAccount": "Ya tengo cuenta",
    
    // Features
    "features.eventManagement": "Gestión de Eventos",
    "features.eventManagementDesc": "Crea y administra eventos agroproductivos con facilidad",
    "features.productCatalog": "Catálogo de Productos",
    "features.productCatalogDesc": "Muestra tus productos con descripciones detalladas e historias",
    "features.attendance": "Control de Asistencia",
    "features.attendanceDesc": "Sistema de QR para registro y seguimiento de asistentes",
    "features.reports": "Reportes y Métricas",
    "features.reportsDesc": "Analiza ventas, asistencias y rendimiento de eventos",
    
    // Roles
    "roles.user": "Usuario Normal",
    "roles.userDesc": "Asiste a eventos y descubre productos",
    "roles.vendor": "Vendedor",
    "roles.vendorDesc": "Vende productos en eventos",
    "roles.organizer": "Organizador",
    "roles.organizerDesc": "Crea y gestiona eventos",
    "roles.admin": "Administrador",
    "roles.adminDesc": "Supervisa la plataforma",
    
    // Auth
    "auth.email": "Correo electrónico",
    "auth.password": "Contraseña",
    "auth.currentPassword": "Contraseña Actual",
    "auth.newPassword": "Nueva Contraseña",
    "auth.confirmPassword": "Confirmar Nueva Contraseña",
    "auth.fullName": "Nombre completo",
    "auth.phone": "Teléfono",
    "auth.role": "Tipo de cuenta",
    "auth.forgotPassword": "¿Olvidaste tu contraseña?",
    "auth.noAccount": "¿No tienes cuenta?",
    "auth.hasAccount": "¿Ya tienes cuenta?",
    "auth.registerHere": "Regístrate aquí",
    "auth.loginHere": "Inicia sesión aquí",
    "auth.loginButton": "Iniciar Sesión",
    "auth.registerButton": "Crear Cuenta",
    "auth.loggingIn": "Iniciando sesión...",
    "auth.creatingAccount": "Creando cuenta...",
    "auth.loginTitle": "Iniciar Sesión",
    "auth.loginSubtitle": "Ingresa tus credenciales para acceder a la plataforma",
    "auth.registerTitle": "Crear Cuenta",
    "auth.registerSubtitle": "Completa el formulario para registrarte en la plataforma",
    
    // Dashboard
    "dashboard.title": "Eventos Agroproductivos",
    "dashboard.subtitle": "Descubre y regístrate en eventos de productores locales",
    "dashboard.upcoming": "Próximos",
    "dashboard.registered": "Mis Registros",
    "dashboard.attended": "Asistidos",
    "dashboard.noUpcoming": "No hay eventos próximos disponibles",
    "dashboard.noUpcomingDesc": "Los nuevos eventos aparecerán aquí cuando estén disponibles",
    "dashboard.noRegistered": "No tienes registros en eventos próximos",
    "dashboard.noRegisteredDesc": "Explora los eventos disponibles y regístrate",
    "dashboard.noAttended": "Aún no has asistido a ningún evento",
    "dashboard.noAttendedDesc": "Los eventos a los que asistas aparecerán aquí",
    "dashboard.viewDetails": "Ver Detalles",
    "dashboard.register": "Registrarse",
    "dashboard.myQR": "Mi QR",
    "dashboard.viewCertificate": "Ver Certificado",
    
    // Profile
    "profile.title": "Mi Perfil",
    "profile.subtitle": "Gestiona tu información personal y configuración",
    "profile.personal": "Personal",
    "profile.security": "Seguridad",
    "profile.notifications": "Notificaciones",
    "profile.privacy": "Privacidad",
    "profile.personalInfo": "Información Personal",
    "profile.personalInfoDesc": "Actualiza tus datos personales",
    "profile.changePassword": "Cambiar Contraseña",
    "profile.changePasswordDesc": "Actualiza tu contraseña para mantener tu cuenta segura",
    "profile.editProfile": "Editar Perfil",
    "profile.saveChanges": "Guardar Cambios",
    "profile.memberSince": "Miembro desde",
    "profile.updated": "Perfil actualizado correctamente",
    "profile.passwordUpdated": "Contraseña actualizada correctamente",
    
    // Contact
    "contact.title": "Contáctanos",
    "contact.subtitle": "¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ayudarte",
    "contact.sendMessage": "Envíanos un Mensaje",
    "contact.sendMessageDesc": "Completa el formulario y te responderemos lo antes posible",
    "contact.name": "Nombre completo",
    "contact.email": "Correo electrónico",
    "contact.phone": "Teléfono",
    "contact.category": "Categoría",
    "contact.subject": "Asunto",
    "contact.message": "Mensaje",
    "contact.send": "Enviar Mensaje",
    "contact.sending": "Enviando...",
    "contact.sent": "¡Mensaje Enviado!",
    "contact.sentDesc": "Hemos recibido tu mensaje correctamente. Nuestro equipo lo revisará y te responderá a la brevedad posible.",
    "contact.info": "Información de Contacto",
    
    // Footer
    "footer.quickLinks": "Enlaces Rápidos",
    "footer.legal": "Legal",
    "footer.terms": "Términos y Condiciones",
    "footer.privacy": "Política de Privacidad",
    "footer.contact": "Contacto",
    "footer.rights": "Todos los derechos reservados",
    "footer.description": "Plataforma integral para la gestión de eventos agroproductivos. Conecta productores, organizadores y asistentes en un solo lugar.",
    
    // Common
    "common.loading": "Cargando...",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.edit": "Editar",
    "common.delete": "Eliminar",
    "common.close": "Cerrar",
    "common.back": "Volver",
    "common.backToHome": "Volver al inicio",
    "common.optional": "opcional",
    "common.required": "obligatorio",
    "common.comingSoon": "Esta funcionalidad estará disponible próximamente",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.events": "Events",
    "nav.vendors": "Vendors",
    "nav.organizers": "Organizers",
    "nav.login": "Log In",
    "nav.register": "Sign Up",
    "nav.profile": "My Profile",
    "nav.logout": "Log Out",
    "nav.admin": "Admin Panel",
    "nav.search": "Search...",
    
    // Home Page
    "home.title": "Agricultural Event Management Platform",
    "home.subtitle": "Connect producers, organizers and attendees in one place. Manage events, products and sales efficiently.",
    "home.startNow": "Get Started",
    "home.login": "Log In",
    "home.features": "Features",
    "home.roles": "Roles and Features",
    "home.rolesSubtitle": "The platform offers different experiences based on your role",
    "home.ready": "Ready to start?",
    "home.readyText": "Join our platform and start managing agricultural events professionally",
    "home.createAccount": "Create Account",
    "home.haveAccount": "Already have an account",
    
    // Features
    "features.eventManagement": "Event Management",
    "features.eventManagementDesc": "Create and manage agricultural events with ease",
    "features.productCatalog": "Product Catalog",
    "features.productCatalogDesc": "Showcase your products with detailed descriptions and stories",
    "features.attendance": "Attendance Control",
    "features.attendanceDesc": "QR system for attendee registration and tracking",
    "features.reports": "Reports and Metrics",
    "features.reportsDesc": "Analyze sales, attendance and event performance",
    
    // Roles
    "roles.user": "Regular User",
    "roles.userDesc": "Attend events and discover products",
    "roles.vendor": "Vendor",
    "roles.vendorDesc": "Sell products at events",
    "roles.organizer": "Organizer",
    "roles.organizerDesc": "Create and manage events",
    "roles.admin": "Administrator",
    "roles.adminDesc": "Oversee the platform",
    
    // Auth
    "auth.email": "Email address",
    "auth.password": "Password",
    "auth.currentPassword": "Current Password",
    "auth.newPassword": "New Password",
    "auth.confirmPassword": "Confirm New Password",
    "auth.fullName": "Full name",
    "auth.phone": "Phone",
    "auth.role": "Account type",
    "auth.forgotPassword": "Forgot your password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.registerHere": "Sign up here",
    "auth.loginHere": "Log in here",
    "auth.loginButton": "Log In",
    "auth.registerButton": "Create Account",
    "auth.loggingIn": "Logging in...",
    "auth.creatingAccount": "Creating account...",
    "auth.loginTitle": "Log In",
    "auth.loginSubtitle": "Enter your credentials to access the platform",
    "auth.registerTitle": "Create Account",
    "auth.registerSubtitle": "Complete the form to register on the platform",
    
    // Dashboard
    "dashboard.title": "Agricultural Events",
    "dashboard.subtitle": "Discover and register for local producer events",
    "dashboard.upcoming": "Upcoming",
    "dashboard.registered": "My Registrations",
    "dashboard.attended": "Attended",
    "dashboard.noUpcoming": "No upcoming events available",
    "dashboard.noUpcomingDesc": "New events will appear here when available",
    "dashboard.noRegistered": "You have no upcoming event registrations",
    "dashboard.noRegisteredDesc": "Explore available events and register",
    "dashboard.noAttended": "You haven't attended any events yet",
    "dashboard.noAttendedDesc": "Events you attend will appear here",
    "dashboard.viewDetails": "View Details",
    "dashboard.register": "Register",
    "dashboard.myQR": "My QR",
    "dashboard.viewCertificate": "View Certificate",
    
    // Profile
    "profile.title": "My Profile",
    "profile.subtitle": "Manage your personal information and settings",
    "profile.personal": "Personal",
    "profile.security": "Security",
    "profile.notifications": "Notifications",
    "profile.privacy": "Privacy",
    "profile.personalInfo": "Personal Information",
    "profile.personalInfoDesc": "Update your personal data",
    "profile.changePassword": "Change Password",
    "profile.changePasswordDesc": "Update your password to keep your account secure",
    "profile.editProfile": "Edit Profile",
    "profile.saveChanges": "Save Changes",
    "profile.memberSince": "Member since",
    "profile.updated": "Profile updated successfully",
    "profile.passwordUpdated": "Password updated successfully",
    
    // Contact
    "contact.title": "Contact Us",
    "contact.subtitle": "Have a question or need help? We're here to help",
    "contact.sendMessage": "Send Us a Message",
    "contact.sendMessageDesc": "Complete the form and we'll respond as soon as possible",
    "contact.name": "Full name",
    "contact.email": "Email address",
    "contact.phone": "Phone",
    "contact.category": "Category",
    "contact.subject": "Subject",
    "contact.message": "Message",
    "contact.send": "Send Message",
    "contact.sending": "Sending...",
    "contact.sent": "Message Sent!",
    "contact.sentDesc": "We've received your message. Our team will review it and respond as soon as possible.",
    "contact.info": "Contact Information",
    
    // Footer
    "footer.quickLinks": "Quick Links",
    "footer.legal": "Legal",
    "footer.terms": "Terms & Conditions",
    "footer.privacy": "Privacy Policy",
    "footer.contact": "Contact",
    "footer.rights": "All rights reserved",
    "footer.description": "Comprehensive platform for agricultural event management. Connect producers, organizers and attendees in one place.",
    
    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.close": "Close",
    "common.back": "Back",
    "common.backToHome": "Back to home",
    "common.optional": "optional",
    "common.required": "required",
    "common.comingSoon": "This feature will be available soon",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es")

  useEffect(() => {
    // Cargar idioma guardado
    const saved = localStorage.getItem("app_language") as Language
    if (saved && (saved === "es" || saved === "en")) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("app_language", lang)
    // Disparar evento para que otros componentes se actualicen
    window.dispatchEvent(new CustomEvent("language-change"))
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations["es"]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
