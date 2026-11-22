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
      repositories: "Verás los repositorios donde está instalada la GitHub App de Pipesor y que tu organización ha habilitado en Pipesor.",
      session: "Tu sesión dura como máximo una hora y solo se conserva en esta pestaña del navegador.",
    },
    manageAccess: "Gestionar el acceso a repositorios en GitHub",
    opensInNewTab: "(se abre en una pestaña nueva)",
    preferences: "Preferencias de visualización",
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
