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
    trend: {
      title: "Evolución del tiempo medio de diagnóstico",
      caption: "{{range}} · Medias semanales",
      bucket: "{{date}}: {{value}}",
    },
    stage: {
      title: "Incidentes por etapa",
      caption: "Incidentes",
    },
    outcome: {
      title: "Resultado del diagnóstico",
      validated_one: "{{countFormatted}} diagnóstico validado",
      validated_other: "{{countFormatted}} diagnósticos validados",
      value: "{{incidents}} · {{percent}}",
      note: "La tasa de confirmación refleja los diagnósticos marcados como confirmados por los operadores. Los porcentajes están redondeados.",
    },
    recurring: {
      title: "Concentración de incidentes por pipeline",
      caption: "Agrupado por pipeline y etapa",
      captionTruncated:
        "Agrupado por pipeline y etapa · Mostrando {{shown}} de {{total}}",
    },
    hint: "Seleccione un grupo para filtrar Incidentes por pipeline y etapa.",
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
