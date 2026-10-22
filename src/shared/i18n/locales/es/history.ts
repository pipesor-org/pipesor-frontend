/**
 * `history` namespace — Spanish.
 *
 * Mirrors `locales/en/history.ts` key-for-key; only the values are translated.
 */
const history = {
  title: "Historial",
  subtitle: "Incidentes CI/CD resueltos y resultados del diagnóstico.",
  demoBadge: "Prototipo · Datos de demo",

  tabs: {
    ariaLabel: "Vistas del historial",
    incidents: "Incidentes",
    insights: "Insights",
  },

  section: {
    title: "Incidentes resueltos",
    sort: "Ordenado por resolución ↓",
  },

  searchPlaceholder: "Buscar incidentes",

  filters: {
    dateRange: "Periodo",
    dateRangeValue: "Periodo: {{range}}",
    repository: "Repositorio",
    pipeline: "Pipeline",
    stage: "Etapa",
    validation: "Validación",
    assignee: "Responsable",
    severity: "Severidad",
  },

  insights: {
    summary: {
      meanDiagnosis: "Tiempo medio de diagnóstico",
      meanResolution: "Tiempo medio de resolución (MTTR)",
      confirmationRate: "Tasa de confirmación de diagnósticos",
      resolvedIncidents: "Incidentes resueltos",
      noData: "Sin datos",
    },
  },

  columns: {
    incidentWorkflow: "Incidente / Pipeline",
    stage: "Etapa",
    diagnosis: "Diagnóstico",
    validation: "Validación",
    assignee: "Responsable",
    diagnosisTime: "Tiempo de\ndiagnóstico",
    resolutionTime: "Tiempo de\nresolución",
    resolved: "Resuelto",
  },

  hint:
    "Seleccione una fila para abrir su espacio de trabajo del incidente en la vista histórica.",

  unassigned: "Sin asignar",

  empty: "No hay incidentes resueltos.",
} as const;

export default history;
