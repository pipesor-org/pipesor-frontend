/**
 * `common` namespace — Spanish.
 *
 * Mirrors `locales/en/common.ts` key-for-key; only the values are translated.
 */
const common = {
  nav: {
    primary: "Principal",
    operations: "Operaciones",
    history: "Historial",
    pipelines: "Pipelines",
    secondary: "Más",
    about: "Acerca de Pipesor",
    settings: "Configuración",
  },
  settings: {
    title: "Configuración",
    subtitle: "Tu cuenta, tus preferencias, la conexión con GitHub y lo que puedes hacer en Pipesor.",
    profile: {
      title: "Cuenta",
      signedIn: "Has iniciado sesión con GitHub como {{login}}.",
      session: "Esta sesión termina a las {{time}} y vive solo en esta pestaña del navegador.",
      signOut: "Cerrar sesión",
      signOutNote: "Cerrar sesión también desconecta tu cuenta de GitHub de Pipesor; tu acceso vuelve cuando inicias sesión de nuevo. No revoca la autorización que diste a la GitHub App de Pipesor.",
      revoke: "Revócala en Authorized GitHub Apps",
      newTab: "se abre en una pestaña nueva",
    },
    preferences: {
      title: "Preferencias",
      language: "Idioma",
      theme: "Tema",
      themes: { system: "Sistema", light: "Claro", dark: "Oscuro" },
      note: "Las preferencias se guardan solo en este navegador.",
    },
    github: {
      title: "GitHub",
      text: "Pipesor lee tus repositorios mediante su GitHub App de solo lectura. Elige en GitHub qué organizaciones y repositorios puede ver.",
      manage: "Elegir repositorios en GitHub",
    },
    access: {
      title: "Tu acceso",
      text: "Los pipelines que puedes ver y lo que puedes hacer en cada uno. El acceso lo da, por pipeline, quien lo configura.",
      workflow: "Workflow",
      repository: "Repositorio",
      level: "Tu acceso",
      empty: "Todavía no tienes acceso a ningún pipeline. Registra un workflow que administres o pide a un administrador del repositorio que te añada.",
      error: "No se pudieron cargar tus pipelines.",
      loading: "Cargando tus pipelines…",
    },
    browser: {
      title: "Guardado en este navegador",
      items: {
        session: "Tu sesión de Pipesor, solo en esta pestaña; termina al cerrar la pestaña o la sesión.",
        preferences: "Preferencias de tema, idioma y barra lateral.",
        nothing: "Sin cookies ni analítica.",
      },
      more: "Cómo protege Pipesor tus datos",
    },
  },
  destinationUnavailable: "aún no disponible",
  sidebar: {
    open: "Abrir navegación",
    close: "Cerrar navegación",
    collapse: "Contraer barra lateral",
    expand: "Expandir barra lateral",
  },
  userMenu: {
    label: "Menú de cuenta",
    signedInWith: "Cuenta de GitHub",
    signOut: "Cerrar sesión",
  },
  language: {
    label: "Idioma",
  },
  theme: {
    label: "Tema",
    switchToDark: "Cambiar a modo oscuro",
    switchToLight: "Cambiar a modo claro",
  },
  filters: {
    scope: "Ámbito",
    scopeMine: "Míos",
    scopeUnassigned: "Sin asignar",
    scopeAll: "Todos",
  },
  duration: {
    daysHours: "{{days}} d {{hours}} h",
    hoursMinutes: "{{hours}} h {{minutes}} min",
    minutes: "{{minutes}} min",
    /** Sub-hour durations keep seconds, zero-padded (`1 min 42 s`, `3 min 05 s`). */
    minutesSeconds: "{{minutes}} min {{seconds}} s",
  },
  notFound: {
    title: "Página no encontrada",
    text: "La página solicitada no existe o aún no se ha implementado.",
    backToOperations: "Volver a Operaciones — Incidentes activos",
  },
} as const;

export default common;
