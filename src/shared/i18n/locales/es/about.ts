/**
 * Namespace `about` — español.
 *
 * Textos del área pública «Acerca de Pipesor»: cómo funciona (recorrido de los
 * datos y glosario), primeros pasos, transparencia de la IA y seguridad.
 */
const about = {
  title: "Acerca de Pipesor",
  subtitle: "Cómo Pipesor convierte una ejecución fallida de GitHub Actions en un diagnóstico que valida una persona, y cómo trata tus datos.",
  tabsLabel: "Secciones de Acerca de Pipesor",
  tabs: {
    "how-it-works": "Cómo funciona",
    "getting-started": "Primeros pasos",
    ai: "Transparencia de la IA",
    security: "Seguridad",
  },
  public: {
    signIn: "Iniciar sesión",
    nav: "Acerca de Pipesor",
  },
  journey: {
    title: "El recorrido de una ejecución fallida",
    lead: "Sigue un fallo desde GitHub hasta un diagnóstico validado. Cada paso muestra adónde van los datos y qué aspecto tienen allí.",
    example: "Ejemplo ilustrativo",
    controls: {
      label: "Controles del recorrido",
      play: "Reproducir",
      pause: "Pausar",
      previous: "Paso anterior",
      next: "Paso siguiente",
      position: "Paso {{current}} de {{total}}",
    },
    where: "Dónde",
    kept: "Qué se guarda",
    steps: {
      run: {
        short: "Falla",
        title: "Falla una ejecución",
        text: "GitHub Actions informa de una ejecución fallida de un workflow monitorizado, o alguien pide a Pipesor que la analice desde el dashboard.",
        where: "GitHub Actions → Ingestión",
        kept: "El log original queda en GitHub (90 días por defecto).",
        sample: "12:04:51 Run ./deploy.sh --env staging\n12:04:52 Using token ghp_EXAMPLE0000000000\n12:04:53 Notify ana.perez@example.com\n12:04:55 Error: Cannot find module 'express'\n12:04:55 Process completed with exit code 1.",
      },
      protect: {
        short: "Protege",
        title: "Se captura y se protege",
        text: "Ingestión lee hasta 40 líneas del primer paso fallido y enmascara correos, direcciones IP, tokens y valores secretos. El log completo nunca se guarda en Pipesor.",
        where: "Ingestión",
        kept: "Solo el extracto protegido y el registro de captura.",
        sample: "12:04:51 Run ./deploy.sh --env staging\n12:04:52 Using token [redacted]\n12:04:53 Notify [redacted]\n12:04:55 Error: Cannot find module 'express'\n12:04:55 Process completed with exit code 1.",
      },
      publish: {
        short: "Publica",
        title: "Se publica como evidencia",
        text: "El extracto protegido viaja por un bus de mensajes interno con un localizador que registra su origen. El localizador prueba la procedencia; nunca concede acceso.",
        where: "Azure Service Bus",
        kept: "Los mensajes caducan a los 14 días.",
        sample: "locator  v2:job:4512:member:3:lines:12-16:sha256:9c1e…\nstage    DEPLOYMENT\nlines    5 (protegidas)",
      },
      process: {
        short: "Correlaciona",
        title: "Se estructura y se correlaciona",
        text: "El procesador NLP convierte las líneas en plantillas de eventos, y el motor de correlación une la evidencia de la misma ejecución con su incidente.",
        where: "Procesador NLP · Motor de correlación",
        kept: "Una instantánea de la evidencia correlacionada.",
        sample: "template  Error: Cannot find module <*>\ntemplate  Process completed with exit code <*>\nrun       #45001707658 · intento 1\nincident  INC-1003 (ejecución de origen)",
      },
      retrieve: {
        short: "Recupera",
        title: "Se recupera conocimiento",
        text: "La generación aumentada por recuperación (RAG) busca en el corpus técnico autorizado los tres pasajes más cercanos a la evidencia.",
        where: "Recuperación RAG · pgvector",
        kept: "Solo documentación autorizada; no aprende de las revisiones.",
        sample: "pasaje  Errores de dependencias de Node.js · §2\npasaje  Lista de comprobación del script de despliegue · §5\npasaje  Caché de instalaciones npm · §1",
      },
      diagnose: {
        short: "Diagnostica",
        title: "Se propone una causa probable",
        text: "El modelo de lenguaje recibe solo la evidencia protegida y los pasajes recuperados, y responde con una estructura fija: causa probable, una comprobación manual, sus limitaciones y las fuentes que usó.",
        where: "Recomendación · Azure OpenAI (Microsoft Foundry)",
        kept: "Un diagnóstico inmutable con la versión del modelo y de las instrucciones.",
        sample: "causa probable    El despliegue corre antes de instalar las dependencias.\ncomprobación      Añade `npm ci` antes de ./deploy.sh y vuelve a ejecutar.\nlimitaciones      Solo se vio el paso fallido.\ncita              evidencia e1 · Errores de dependencias de Node.js §2",
      },
      incident: {
        short: "Incidente",
        title: "Se abre un incidente",
        text: "Pipeline abre un incidente para la ejecución fallida, con su etapa y severidad, y el dashboard lo muestra junto a su diagnóstico.",
        where: "Pipeline · Dashboard",
        kept: "El incidente y cada paso de su ciclo de vida, auditados.",
        sample: "INC-1003  Alta · Despliegue · Abierto\ncausa probable  El despliegue corre antes de instalar…\nvalidación      Pendiente",
      },
      validate: {
        short: "Valida",
        title: "Una persona lo valida",
        text: "Alguien con acceso para operar confirma el diagnóstico, lo corrige con la causa real o lo rechaza. Nada se ejecuta automáticamente.",
        where: "Dashboard · Recomendación",
        kept: "Un historial de revisiones que solo se amplía.",
        sample: "Confirmado   la causa propuesta era correcta\nCorregido    causa real: el lockfile estaba desactualizado\nRechazado    no era la causa",
      },
    },
  },
  tracks: {
    title: "Dos recorridos que nunca se mezclan",
    lead: "El ciclo de vida de un incidente y la validación de su diagnóstico avanzan por separado: resolver un incidente nunca confirma ni rechaza su diagnóstico.",
    incident: {
      title: "Ciclo de vida del incidente",
      note: "Lo registran las personas. Resolver exige una ejecución de verificación exitosa.",
      steps: { open: "Abierto", remediation: "En remediación", verification: "Verificación", resolved: "Resuelto" },
    },
    validation: {
      title: "Validación del diagnóstico",
      note: "Pendiente hasta que una persona lo revisa. Las revisiones nunca se reescriben.",
      steps: { pending: "Pendiente", outcome: "Confirmado · Corregido · Rechazado" },
    },
  },
  glossary: {
    title: "Glosario",
    lead: "Los términos que usa Pipesor, tal como los define su arquitectura. Los que forman parte del recorrido te llevan a su paso.",
    search: "Buscar términos",
    categoriesLabel: "Filtrar por tema",
    categories: {
      all: "Todos",
      flow: "Flujo de datos",
      incident: "Incidentes",
      validation: "Diagnóstico",
      access: "Acceso",
      ai: "IA",
      metrics: "Métricas",
    },
    seeInJourney: "Ver en el recorrido",
    count_one: "{{count}} término",
    count_other: "{{count}} términos",
    empty: "Ningún término coincide con esta búsqueda.",
    terms: {
      monitoredWorkflow: { term: "Workflow monitorizado (pipeline)", definition: "Un workflow de GitHub Actions registrado en Pipesor. Aquí pipeline y workflow significan lo mismo." },
      run: { term: "Ejecución e intento", definition: "Una ejecución de un workflow en GitHub Actions. Volver a ejecutarla crea un nuevo intento de la misma ejecución." },
      evidence: { term: "Evidencia", definition: "Extractos de log observados y protegidos de una ejecución fallida, guardados con el localizador que indica su origen." },
      sanitization: { term: "Protección (saneamiento)", definition: "Enmascarar correos, direcciones IP, tokens y valores secretos, y conservar como máximo 40 líneas, antes de cualquier procesamiento o IA." },
      locator: { term: "Localizador de origen", definition: "Referencia al job, archivo y líneas exactos de un extracto, con un hash del original. Prueba la procedencia, no el acceso." },
      correlation: { term: "Correlación", definition: "Unir toda la evidencia de una misma ejecución e intento con el incidente que abrió, en una instantánea inmutable." },
      incident: { term: "Incidente", definition: "Se abre a partir de una ejecución fallida (su ejecución de origen). Registra la etapa, la severidad y el trabajo de las personas hasta que se resuelve." },
      displayNumber: { term: "Número INC", definition: "Un número legible como INC-1003, solo para presentación. El sistema identifica los incidentes con un id interno." },
      severity: { term: "Severidad", definition: "Lo grave que es un incidente (Crítica, Alta, Media, Baja). Parte de la criticidad del pipeline." },
      criticality: { term: "Criticidad", definition: "Lo importante que es un pipeline, definida por quien lo registra. Cambiarla después no altera los incidentes existentes." },
      stage: { term: "Etapa", definition: "Dónde falló la ejecución: compilación, pruebas, control de calidad, despliegue, contenedor o infraestructura." },
      remediation: { term: "Remediación", definition: "El trabajo humano para corregir la causa. Iniciarla registra el paso y la hora; Pipesor nunca ejecuta correcciones." },
      verificationRun: { term: "Ejecución de verificación", definition: "Una ejecución posterior vinculada al incidente tras la remediación. Hace falta una exitosa para resolverlo." },
      diagnosis: { term: "Diagnóstico", definition: "La respuesta versionada e inmutable del modelo para la ejecución de origen de un incidente." },
      probableCause: { term: "Causa probable", definition: "Una hipótesis sobre por qué falló la ejecución. Sigue siendo probable hasta que una persona la valida." },
      recommendation: { term: "Comprobación manual", definition: "Lo que el modelo sugiere que una persona verifique o haga a continuación. Nunca se ejecuta." },
      limitations: { term: "Limitaciones", definition: "Lo que el modelo declara que no pudo ver o de lo que no está seguro. Pipesor no muestra un porcentaje de confianza." },
      validation: { term: "Validación (revisión)", definition: "La decisión de una persona sobre un diagnóstico: Confirmado, Corregido (con la causa real) o Rechazado. Pendiente hasta entonces." },
      humanInTheLoop: { term: "Humano en el ciclo", definition: "Todo diagnóstico es una propuesta hasta que una persona lo revisa, y ninguna recomendación se ejecuta sola." },
      capabilities: { term: "Capacidades", definition: "Lo que una persona puede hacer en un pipeline: Ver, Operar (pasos del incidente y revisiones) o Configurar (política y personas; no incluye Operar)." },
      grant: { term: "Acceso (permiso)", definition: "Una capacidad explícita dada a una persona en un pipeline. Además exige acceso vigente al repositorio en GitHub." },
      githubApp: { term: "GitHub App de Pipesor", definition: "La app de solo lectura que instala quien administra un repositorio para que Pipesor lea las ejecuciones y metadatos de los workflows." },
      admission: { term: "Admisión", definition: "Un repositorio se puede monitorizar cuando quien lo administra lo selecciona en la GitHub App de Pipesor." },
      rag: { term: "RAG", definition: "Generación aumentada por recuperación: encontrar pasajes relevantes en un corpus autorizado para fundamentar la respuesta del modelo." },
      corpus: { term: "Corpus", definition: "La documentación técnica autorizada en la que busca RAG. Está separado del material de evaluación y no aprende de las revisiones." },
      embedding: { term: "Embedding", definition: "Un vector numérico (1536 dimensiones) que permite a RAG comparar textos por su significado." },
      mttr: { term: "MTTR", definition: "Tiempo medio de resolución: desde la detección hasta la resolución de un incidente." },
      meanDiagnosisTime: { term: "Tiempo medio de diagnóstico", definition: "Desde la detección hasta que el diagnóstico está listo." },
      confirmationRate: { term: "Tasa de confirmación", definition: "Revisiones confirmadas sobre confirmadas más rechazadas (corregido cuenta como rechazado). Mide revisiones humanas, no la precisión del modelo." },
      recurring: { term: "Contexto recurrente", definition: "Incidentes agrupados por pipeline y etapa. Es una agrupación, no una taxonomía de causas raíz." },
    },
  },
  start: {
    title: "Primeros pasos",
    lead: "Cinco pasos desde un espacio vacío hasta un diagnóstico validado y compartido con tu equipo.",
    who: "Quién",
    roles: { admin: "Quien administra el repositorio", operator: "Quien tiene acceso para operar", configurer: "Quien configura el pipeline" },
    steps: {
      install: {
        title: "Da a Pipesor acceso de lectura",
        text: "Instala la GitHub App de Pipesor y selecciona los repositorios a monitorizar. Es de solo lectura: el código, los workflows, los secretos y los permisos no cambian.",
        action: "Elegir repositorios en GitHub",
      },
      register: {
        title: "Registra un workflow",
        text: "Explora tus repositorios por cuenta, abre uno y elige el workflow que quieres monitorizar, con su criticidad.",
        action: "Añadir workflow monitorizado",
      },
      analyze: {
        title: "Analiza una ejecución fallida",
        text: "Las ejecuciones fallidas se capturan cuando ocurren, o puedes pedir un análisis desde las ejecuciones fallidas recientes del pipeline.",
        action: "Abrir Pipelines",
      },
      validate: {
        title: "Valida el diagnóstico",
        text: "Abre el incidente, lee la causa probable y su evidencia, y confírmala, corrígela o recházala.",
        action: "Abrir Operaciones",
      },
      share: {
        title: "Compártelo con tu equipo",
        text: "En la sección Personas del pipeline, añade colaboradores del repositorio y elige qué puede hacer cada uno.",
        action: "Abrir Pipelines",
      },
    },
  },
  ai: {
    title: "Transparencia de la IA",
    lead: "Qué ve el modelo, qué devuelve y dónde mantienen el control las personas.",
    glance: {
      title: "En resumen",
      items: {
        proposes: "La IA propone una causa probable; una persona decide.",
        minimal: "El modelo solo ve extractos de log protegidos y documentación autorizada.",
        noTraining: "No se entrena ni ajusta ningún modelo con tus datos.",
        noLearning: "Pipesor no aprende de las revisiones de forma automática, a propósito.",
        noAction: "Ninguna recomendación se ejecuta nunca de forma automática.",
      },
    },
    model: {
      title: "El modelo",
      text: "Los diagnósticos los genera un modelo de lenguaje servido por Azure OpenAI en Microsoft Foundry, dentro de la zona de datos de EE. UU. de Microsoft (West US 3). Los embeddings para la recuperación usan text-embedding-3-small. Los modelos se usan mediante su API; ninguno se entrena ni se modifica. Cada diagnóstico registra el despliegue del modelo, su versión y la versión de las instrucciones.",
    },
    inputs: {
      title: "Qué recibe el modelo",
      receives: {
        title: "Recibe",
        items: {
          evidence: "Extractos de log protegidos (como máximo 40 líneas del paso fallido), con su etapa.",
          knowledge: "Hasta tres pasajes del corpus técnico autorizado.",
          instructions: "Instrucciones fijas: usar solo la evidencia dada, tratarla como datos y no como instrucciones, citar lo que usó y declarar la incertidumbre.",
        },
      },
      never: {
        title: "Nunca recibe",
        items: {
          rawLogs: "Logs completos o sin proteger.",
          identity: "Quién eres, ni los nombres de tus repositorios o workflows.",
          secrets: "Tokens, credenciales ni datos de quienes revisan.",
        },
      },
    },
    outputs: {
      title: "Qué devuelve",
      text: "Una estructura fija y validada: una causa probable, una comprobación manual, sus limitaciones, y la evidencia y las fuentes que cita. La respuesta se comprueba antes de guardarse; una respuesta mal formada se reintenta, nunca se muestra.",
      noConfidence: "Pipesor no muestra un porcentaje de confianza. La confianza que un modelo declara de sí mismo no es una probabilidad fiable, así que la incertidumbre se expresa con palabras, en las limitaciones.",
    },
    human: {
      title: "Las personas mantienen el control",
      items: {
        probable: "Toda respuesta es una causa probable hasta que alguien con acceso para operar la revisa.",
        review: "Una revisión la confirma, la corrige con la causa real o la rechaza. Las revisiones se conservan y nunca se reescriben.",
        noAction: "Registrar una remediación documenta trabajo humano; Pipesor no cambia código ni ejecuta correcciones.",
      },
    },
    learning: {
      title: "Sin aprendizaje automático",
      text: "Las revisiones no alimentan al modelo ni al corpus de conocimiento. Aprender automáticamente de ellas podría repetir el error de quien revisa y contaminaría la evaluación. Para la siguiente fase está previsto un ciclo curado: diagnósticos corregidos que una persona responsable aprueba antes de entrar al corpus.",
    },
    evaluation: {
      title: "Cómo se evaluó",
      text: "En la evaluación de la tesis, la revisión humana dio por correctos 17 de 20 diagnósticos (85 %; intervalo de confianza del 95 %: 64 %–95 %). El intervalo no permite afirmar, con un 95 % de confianza, un acierto del 80 % o más. Las recomendaciones fueron accionables en 4 de 20 casos y la mediana hasta tener un diagnóstico fue de 33 segundos. Quienes revisaron fueron los autores del sistema, con una persona por caso.",
    },
    limits: {
      title: "Limitaciones conocidas",
      items: {
        window: "Solo ve el extracto del primer paso fallido, no el log completo.",
        masking: "La protección puede eliminar detalles útiles, como versiones o direcciones.",
        variance: "El modelo no es determinista: el mismo fallo puede explicarse de formas distintas.",
        expired: "Si GitHub ya borró los logs de una ejecución, no se puede analizar.",
        scope: "Los resultados provienen de tres repositorios y no se generalizan a cualquier tipo de pipeline.",
      },
    },
  },
  security: {
    title: "Seguridad",
    lead: "Los controles aplicados y los límites aceptados en este prototipo.",
    sections: {
      signIn: {
        title: "Inicio de sesión y sesiones",
        items: {
          github: "Inicias sesión con GitHub (OAuth con PKCE y un state de un solo uso). Pipesor no tiene contraseñas propias.",
          session: "Una sesión de Pipesor dura como máximo una hora y vive solo en la pestaña del navegador; no se renueva en el navegador.",
          tokens: "Tu token de GitHub nunca llega al navegador: lo custodian los servicios en Azure Key Vault.",
        },
      },
      access: {
        title: "Dos capas de autorización",
        items: {
          explicit: "Cada pipeline concede capacidades explícitas (Ver, Operar, Configurar) a personas concretas.",
          github: "Cada petición comprueba además tu acceso vigente al repositorio en GitHub; si lo pierdes allí, lo pierdes aquí.",
          nothing: "Iniciar sesión no da acceso a ningún dato, y ningún rol de GitHub concede acceso en Pipesor automáticamente.",
        },
      },
      github: {
        title: "Acceso de solo lectura a GitHub",
        items: {
          permissions: "La GitHub App de Pipesor solo pide lectura de Actions y metadatos.",
          noChanges: "Pipesor nunca cambia código, workflows, secretos, permisos ni configuración de tus repositorios.",
        },
      },
      data: {
        title: "Protección de los datos",
        items: {
          minimal: "Solo se procesa un extracto protegido de 40 líneas como máximo; el log completo queda en GitHub.",
          masking: "Se enmascaran correos, direcciones IP, tokens de GitHub, JWT y valores secretos; se rechazan extractos con claves privadas.",
          logs: "Los logs técnicos registran identificadores y resultados, nunca el contenido de los logs ni tokens.",
        },
      },
      infrastructure: {
        title: "Infraestructura",
        items: {
          https: "Todo el tráfico usa HTTPS.",
          database: "La base de datos es privada dentro de la red virtual y usa identidades de Azure en lugar de contraseñas.",
          secrets: "Los secretos viven en Azure Key Vault con acceso por roles.",
          services: "Cada servicio tiene su propia identidad con el mínimo privilegio, y los servicios se llaman entre sí con tokens de corta duración.",
        },
      },
      browser: {
        title: "En tu navegador",
        items: {
          headers: "Una política de seguridad de contenido estricta, sin incrustación en otras páginas y sin filtrar el referer.",
          storage: "Sin cookies ni analítica. Solo se guardan tu sesión (en esta pestaña) y tus preferencias de visualización.",
        },
      },
      audit: {
        title: "Trazabilidad",
        items: {
          audit: "Se registran los registros de workflows, los cambios de acceso, la configuración y los pasos de los incidentes, con quién los hizo.",
          reviews: "Las revisiones de diagnósticos solo se amplían, nunca se modifican.",
        },
      },
      limits: {
        title: "Límites aceptados en este prototipo",
        items: {
          mfa: "Sin autenticación multifactor propia: se aplica la seguridad de tu cuenta de GitHub.",
          revocation: "Las sesiones no pueden revocarse de forma central antes de caducar (una hora como máximo).",
          gateway: "Sin cortafuegos de aplicaciones web ni límite de peticiones por persona.",
          environment: "Funciona en un entorno académico de desarrollo en Azure.",
        },
      },
    },
  },
} as const;

export default about;
