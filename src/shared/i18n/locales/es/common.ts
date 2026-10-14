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
  },
  notFound: {
    title: "Página no encontrada",
    text: "La página solicitada no existe o aún no se ha implementado.",
    backToOperations: "Volver a Operaciones — Incidentes activos",
  },
} as const;

export default common;
