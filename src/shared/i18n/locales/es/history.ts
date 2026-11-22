/**
 * `history` namespace — Spanish.
 *
 * Mirrors `locales/en/history.ts` key-for-key; only the values are translated.
 */
const history = {
  title: "Historial",
  subtitle: "Incidentes CI/CD resueltos y resultados del diagnóstico.",

  tabs: {
    ariaLabel: "Vistas del historial",
    incidents: "Incidentes",
    insights: "Insights",
  },

  section: {
    title: "Incidentes resueltos",
    sort: "Ordenado por resolución ↓",
  },

  settling: "Cargando los diagnósticos de los incidentes resueltos…",
  loadMore: "Cargar más incidentes resueltos",

  insights: {
    scope_one: "Últimos {{days}} días ({{range}}) · Calculado sobre {{countFormatted}} incidente resuelto de {{loaded}} cargados.",
    scope_other: "Últimos {{days}} días ({{range}}) · Calculado sobre {{countFormatted}} incidentes resueltos de {{loaded}} cargados.",
    summary: {
      meanDiagnosis: "Tiempo medio de diagnóstico",
      meanResolution: "Tiempo medio de resolución (MTTR)",
      confirmationRate: "Tasa de confirmación del diagnóstico",
      resolvedIncidents: "Incidentes resueltos",
      noData: "Sin datos",
    },
    trend: {
      title: "Tiempo medio de diagnóstico en el tiempo",
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
      rejected: "Rechazado",
      note: "La tasa de confirmación cuenta revisiones humanas: Rechazado incluye los rechazos con causa real; las revisiones pendientes se excluyen. No mide la precisión del modelo. Los porcentajes están redondeados.",
    },
    recurring: {
      title: "Concentración de incidentes por pipeline",
      caption: "Agrupado por pipeline y etapa",
      captionTruncated:
        "Agrupado por pipeline y etapa · Mostrando {{shown}} de {{total}}",
      pipelineUnavailable: "Datos del pipeline no disponibles",
    },
  },

  filters: {
    pipeline: "Pipeline",
  },

  columns: {
    incidentWorkflow: "Incidente / Pipeline",
    stage: "Etapa",
    diagnosis: "Diagnóstico",
    validation: "Validación",
    diagnosisTime: "Tiempo de\ndiagnóstico",
    resolutionTime: "Tiempo de\nresolución",
    resolved: "Resuelto",
  },

  hint: "Seleccione un incidente para abrir su espacio de trabajo en vista histórica.",
  noDiagnosis: "Sin diagnóstico",
  empty: "Todavía no hay incidentes resueltos.",
} as const;

export default history;
