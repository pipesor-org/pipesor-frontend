/**
 * `auth` namespace — Spanish.
 *
 * Mirrors `locales/en/auth.ts` key-for-key; only the values are translated.
 */
const auth = {
  signIn: {
    title: "Conecta tu cuenta de GitHub",
    lead: "Pipesor supervisa tus workflows de GitHub Actions, diagnostica las ejecuciones fallidas y permite que tu equipo revise cada diagnóstico.",
    continue: "Continuar con GitHub",
    redirecting: "Redirigiendo a GitHub…",
    points: {
      readOnly: "Solo lectura: Pipesor nunca modifica tu código, workflows, secretos ni permisos de GitHub.",
      repositories: "Cualquier cuenta de GitHub puede entrar. Los repositorios aparecen cuando su administrador los selecciona en la GitHub App de Pipesor, y solo ves los que puedes leer en GitHub.",
      session: "Tu sesión dura como máximo una hora y solo se conserva en esta pestaña del navegador.",
    },
    manageAccess: "Instalar la GitHub App o gestionar el acceso a repositorios",
    preferences: "Preferencias de visualización",
    about: { label: "Acerca de Pipesor", howItWorks: "Cómo funciona", ai: "Transparencia de la IA", security: "Seguridad" },
  },
  ended: {
    expired: "Tu sesión expiró. Inicia sesión de nuevo para continuar donde lo dejaste.",
    unauthorized: "Tu sesión ya no es válida. Inicia sesión de nuevo para continuar.",
    signedOut: "Cerraste sesión en Pipesor.",
  },
  complete: {
    working: "Completando el inicio de sesión…",
    failedTitle: "No se pudo completar el inicio de sesión",
    failedText: "El inicio de sesión con GitHub no terminó. Los enlaces de la redirección solo se pueden usar una vez y caducan al minuto.",
    missing: "A esta página solo se llega desde la redirección del inicio de sesión con GitHub.",
    network: "No se pudo contactar con Pipesor. Revisa tu conexión e inténtalo de nuevo.",
    tryAgain: "Iniciar sesión de nuevo",
    reference: "Código de error: {{code}}",
  },
} as const;

export default auth;
