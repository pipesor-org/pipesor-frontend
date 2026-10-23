const pipelines = {
  demoBadge: "Prototipo · Datos de demo",
  backUnavailable: "← Volver a Pipelines — inventario aún no disponible",
  demoContext: "Demostración de solo lectura · Catálogo sintético de workflows, sin conexión activa con GitHub.",
  identity: {
    title: "Identidad",
    description: "Contexto de GitHub de solo lectura. El código del workflow permanece en GitHub.",
    repository: "Repositorio", workflow: "Workflow", file: "Archivo del workflow",
    branch: "Rama predeterminada", provider: "Proveedor",
    linksUnavailable: "Los enlaces de GitHub no están disponibles: estos registros de demostración no incluyen destinos.",
  },
  policy: {
    title: "Política operativa", criticality: "Criticidad", monitoring: "Monitoreo",
    environment: "Entorno operativo", unspecified: "Sin especificar",
    description: "Contexto gestionado por Pipesor. La criticidad no es la severidad del incidente; el entorno no es un GitHub Environment ni un filtro de ramas.",
    monitoringNote: "Activo/Pausado controla el monitoreo AIOps, no la ejecución de GitHub. El monitoreo abarca ejecuciones autorizadas en todas las ramas; la rama predeterminada es solo informativa.",
  },
  ownership: {
    title: "Responsabilidad", team: "Equipo responsable", owners: "Responsables del pipeline",
    unspecified: "Sin especificar",
    note: "La responsabilidad operativa no asigna incidentes ni otorga permisos de GitHub.",
  },
  access: {
    title: "Acceso", note: "Ejemplos ilustrativos de capacidades: no representan permisos efectivos para este pipeline.",
    role: "Rol / equipo de ejemplo", capability: "Capacidad", description: "Descripción",
    lead: "Líder técnico", administrators: "Administradores de pipelines",
    operate: "Operar", view: "Consultar", configure: "Configurar",
    operateDescription: "Tomar incidentes, iniciar la remediación, resolver y validar diagnósticos.",
    viewDescription: "Consultar pipelines autorizados, incidentes, diagnósticos y evidencias.",
    configureDescription: "Cambiar la criticidad, la responsabilidad y la configuración operativa.",
  },
  update: {
    title: "Última actualización de configuración", empty: "Este registro de demostración no incluye datos de actualizaciones de configuración.",
    note: "Los ejemplos iniciales de workflows no son eventos de auditoría. Esta vista de solo lectura no registra cambios de la sesión local ni un historial duradero de configuración.",
  },
  criticality: { Critical: "Crítica", High: "Alta", Medium: "Media", Low: "Baja" },
  monitoring: { Active: "Activo", Paused: "Pausado" },
  environment: { Production: "Producción", QA: "QA", Development: "Desarrollo" },
} as const;

export default pipelines;
