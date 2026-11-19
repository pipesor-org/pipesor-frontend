/**
 * `operations` namespace — Spanish.
 *
 * Mirrors `locales/en/operations.ts` key-for-key; only the values are
 * translated. Repository names, workflow names, diagnoses and technical
 * evidence live in the domain data, not here, and stay untranslated.
 */
const operations = {
  title: "Operaciones",
  demoBadge: "Prototipo · Datos de demo",

  diagnosticReview: {
    generated: "Hipótesis original generada",
    title: "Revisión humana",
    version: "Versión del diagnóstico {{version}}",
    PENDING: "Pendiente de revisión",
    CONFIRMED: "Confirmado",
    CORRECTED: "Corregido",
    REJECTED: "Rechazado",
    newReview: "Registrar revisión",
    decision: "Decisión",
    justification: "Justificación",
    actualCause: "Causa corregida",
    correctedRecommendation: "Recomendación corregida (opcional)",
    save: "Guardar revisión",
    saved: "Revisión guardada.",
    failed: "No se pudo guardar la revisión.",
    conflict: "Se guardó otra revisión. Vuelve a cargar el diagnóstico antes de enviarla.",
    history: "Historial de revisión",
  },
  diagnosticDemo: {
    replayTitle: "Diagnóstico reproducido localmente",
    replayDescription: "Esta vista usa evidencia reproducida y una identidad de prueba autorizada. La revisión se guarda en PostgreSQL.",
    title: "Demostración de diagnóstico",
    description: "Consulta el diagnóstico sintético en el servicio local de recomendaciones.",
    choose: "Token de acceso local",
    load: "Cargar diagnóstico",
    loading: "Consultando el diagnóstico",
    invalid: "El servicio devolvió un diagnóstico inválido o citas que no coinciden.",
    unauthenticated: "Se rechazó el token de acceso.",
    unavailable: "El servicio de diagnóstico no está disponible. Inténtalo de nuevo.",
    result: "Resultado del diagnóstico",
    cause: "Causa probable",
    recommendation: "Recomendación",
    limitations: "Limitaciones",
    evidence: "Evidencia de respaldo",
    incident: "ID de incidente",
    context: "ID de contexto",
    correlation: "ID de correlación",
    execution: "ID de ejecución",
    origin: "ID del contexto de origen",
    sources: "Fuentes recuperadas",
    document: "ID del documento",
    chunk: "ID del fragmento",
    noSources: "No se recuperaron fuentes.",
  },

  tabs: {
    ariaLabel: "Colas de incidentes",
    activeIncidents: "Incidentes activos",
    needsValidation: "Pendientes de validación",
  },

  table: {
    severity: "Severidad",
    incidentWorkflow: "Incidente / Flujo de trabajo",
    stage: "Etapa",
    diagnosis: "Diagnóstico",
    proposedDiagnosis: "Diagnóstico propuesto",
    status: "Estado",
    assignee: "Responsable",
    elapsed: "Transcurrido",
    resolved: "Resuelto",
    validation: "Validación",
    assignToMe: "Asignármelo",
    unassigned: "Sin asignar",
  },

  severity: {
    critical: "Crítica",
    high: "Alta",
    medium: "Media",
    low: "Baja",
  },
  status: {
    open: "Abierto",
    inRemediation: "En remediación",
    verification: "Verificación",
    resolved: "Resuelto",
  },
  validationStatus: {
    notApplicable: "No aplicable",
    pending: "Pendiente",
    confirmed: "Confirmado",
    rejected: "Rechazado",
  },
  stage: {
    deployment: "Despliegue",
    infrastructure: "Infraestructura",
    testing: "Pruebas",
    qualityGate: "Puerta de calidad",
    container: "Contenedor",
    build: "Compilación",
  },

  filters: {
    severity: "Severidad",
    repository: "Repositorio",
    stage: "Etapa",
    status: "Estado",
    assignee: "Responsable",
    resolvedDate: "Fecha de resolución",
  },

  active: {
    subtitle:
      "Gestione y clasifique incidentes de CI/CD en los flujos de trabajo de GitHub Actions monitorizados.",
    hint: "Seleccione una fila para abrir su espacio de trabajo del incidente.",
    searchPlaceholder: "Buscar incidentes o flujos de trabajo…",
    sortLabel: "Severidad ↓ · Transcurrido ↓",
    summary: {
      ariaLabel_one: "Resumen de incidentes: {{count}} incidente activo",
      ariaLabel_other: "Resumen de incidentes: {{count}} incidentes activos",
      active: "Incidentes activos",
      analyzing: "Analizando",
    },
  },

  validation: {
    subtitle:
      "Revise los incidentes de CI/CD resueltos pendientes de validación humana del diagnóstico.",
    hint: "Seleccione una fila para revisar la evidencia y validar su diagnóstico en el espacio de trabajo del incidente.",
    searchPlaceholder: "Buscar incidentes…",
    sortLabel: "Más antiguo pendiente primero",
    summary: {
      ariaLabel_one:
        "Resumen de validación: {{count}} incidente pendiente de validación",
      ariaLabel_other:
        "Resumen de validación: {{count}} incidentes pendientes de validación",
      pending: "Validación pendiente",
      oldestPending: "Más antiguo pendiente",
    },
    pendingFor: "{{duration}} pendiente",
    empty: {
      title: "No hay diagnósticos pendientes de validación",
      text: "Todos los incidentes resueltos que requerían revisión del diagnóstico se han validado.",
    },
  },

  snapshot: "Instantánea de demo · {{timestamp}}",
} as const;

export default operations;
