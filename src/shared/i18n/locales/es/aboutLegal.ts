/**
 * Espacio de nombres `about` — español: Política de privacidad, Términos de
 * uso y el mapeo de estándares de Transparencia de la IA. Los identificadores
 * de sección (`privacy.controller`, `terms.nature`…) son los de los textos de
 * la tesis. Todo describe el sistema implementado (ficha:
 * docs/content/ficha-tecnica-paginas-informativas.md).
 */

export const legal = {
  updated: "Última actualización: {{date}}",
  contents: "En esta página",
  team: "Pipesor Team",
  external: "se abre en una pestaña nueva",
};

export const privacy = {
  title: "Política de privacidad y tratamiento de datos personales",
  intro: {
    prototype: "Pipesor es el prototipo de una tesis de la Universidad Peruana de Ciencias Aplicadas (UPC), desplegado en un entorno de desarrollo. No es un servicio comercial.",
    scope: "Esta política explica qué datos personales tratamos, para qué, dónde y durante cuánto tiempo, conforme a la Ley N.º 29733, Ley de Protección de Datos Personales, y a su Reglamento, aprobado por el Decreto Supremo N.º 016-2024-JUS.",
  },
  sections: {
    controller: {
      title: "Responsable y contacto",
      text: "El responsable del tratamiento de tus datos es Pipesor Team, formado por los autores de la tesis:",
      contact: "Para cualquier consulta sobre esta política o sobre tus datos, escribe a cualquiera de ellos.",
    },
    data: {
      title: "Qué datos tratamos",
      table: {
        columns: { data: "Dato", purpose: "Para qué", audience: "Quién lo ve" },
        rows: {
          githubId: {
            data: "Tu identificador numérico de usuario de GitHub",
            purpose: "Identificarte al iniciar sesión",
            audience: "Tú y Pipesor Team",
          },
          githubLogin: {
            data: "Tu usuario (login) de GitHub",
            purpose: "Mostrar quién ha iniciado sesión y registrar los intentos de inicio de sesión",
            audience: "Tú y Pipesor Team",
          },
          internalId: {
            data: "Un identificador interno, derivado de tu identificador de GitHub",
            purpose: "Gestionar permisos, auditoría y autoría de tus revisiones",
            audience: "Quien configura el pipeline. Quien puede ver el pipeline ve la autoría de las revisiones",
          },
          githubToken: {
            data: "Tu token de acceso de GitHub",
            purpose: "Leer GitHub en tu nombre, solo con permisos de lectura",
            audience: "Solo los servicios de Pipesor. Nunca llega a tu navegador",
          },
          reviews: {
            data: "El texto de tus revisiones (comentario y causa real, hasta 1500 caracteres)",
            purpose: "Validar el diagnóstico",
            audience: "Quien puede ver el pipeline",
          },
          pipelineData: {
            data: "Datos del pipeline: repositorio, workflow, rama, commit y ejecuciones",
            purpose: "Operar el servicio",
            audience: "Quien puede ver el pipeline",
          },
          logExcerpts: {
            data: "Extractos de log saneados, de hasta 40 líneas",
            purpose: "Servir de evidencia del diagnóstico",
            audience: "Quien puede ver el pipeline",
          },
          accessLogs: {
            data: "Registros de acceso al dashboard: tu dirección IP, la fecha y hora, la página solicitada y tu navegador",
            purpose: "Proteger el servicio e investigar errores",
            audience: "Pipesor Team",
          },
          report: {
            data: "Reporte del diagnóstico, solo si el repositorio añade el workflow de reporte de Pipesor: el diagnóstico, las evidencias saneadas y las fuentes, sin las revisiones",
            purpose: "Conservar el diagnóstico junto a la ejecución fallida en GitHub",
            audience: "Quien puede ver los artefactos de Actions del repositorio en GitHub",
          },
        },
      },
      source: "Estos datos proceden de GitHub —de tu cuenta al iniciar sesión, y de los repositorios y ejecuciones que puede leer la GitHub App de Pipesor— o de lo que escribes en Pipesor.",
      noEmail: "No guardamos tu correo electrónico. Los correos que aparecen dentro de los logs se enmascaran.",
      collaborators: "El avatar, el usuario y el rol de los colaboradores de un repositorio no se guardan: se consultan a GitHub cuando quien configura un pipeline elige a quién dar acceso.",
      names: "Ten en cuenta: los extractos de log pueden contener nombres de personas o de usuarios, por ejemplo el autor de un commit o una ruta de archivo. El saneamiento no detecta nombres.",
    },
    purposes: {
      title: "Para qué los usamos",
      lead: "Usamos tus datos para:",
      items: {
        session: "identificarte y mantener tu sesión;",
        access: "comprobar en cada petición tu permiso en Pipesor y tu acceso vigente al repositorio en GitHub;",
        diagnose: "capturar las ejecuciones fallidas de los workflows registrados y generar un diagnóstico probable;",
        validate: "registrar la validación humana de cada diagnóstico y el ciclo de vida de cada incidente;",
        audit: "mantener una auditoría de registros, permisos, configuración y cambios de estado;",
        security: "conservar los registros de acceso al dashboard para proteger el servicio e investigar errores.",
      },
      noTraining: "Pipesor no incluye analítica ni telemetría. No entrenamos modelos de IA con tus datos.",
    },
    basis: {
      title: "Base legal y consentimiento",
      consent: "Tratamos tus datos con tu consentimiento. Lo das en la pantalla de inicio de sesión, al marcar la casilla que acepta esta política y los Términos de uso antes de continuar con GitHub. También cubre la transferencia internacional descrita en «Encargados y transferencias internacionales».",
      withdraw: "Puedes revocarlo en cualquier momento: cierra sesión y escribe a Pipesor Team. Revocarlo no afecta al tratamiento realizado antes.",
    },
    browser: {
      title: "Datos en tu navegador",
      noCookies: "Pipesor no usa cookies, ni herramientas de analítica o telemetría.",
      items: {
        session: "sessionStorage, que se borra al cerrar la pestaña: tu sesión de Pipesor (un token de acceso que caduca en una hora como máximo, y tu identificador y usuario de GitHub) y la página a la que volver después de instalar la GitHub App.",
        preferences: "localStorage: solo tus preferencias de interfaz (tema, idioma y barra lateral).",
        fonts: "Fuentes tipográficas: las sirve el propio Pipesor. Tu navegador no contacta con ningún proveedor de fuentes.",
        avatars: "Fotos de perfil: se cargan desde los servidores de GitHub (avatars.githubusercontent.com), así que GitHub recibe tu dirección IP cuando se muestra una.",
      },
    },
    processors: {
      title: "Encargados y transferencias internacionales",
      lead: "Pipesor se apoya en estos proveedores:",
      items: {
        azure: "Microsoft Azure (Microsoft Corporation): alojamiento, base de datos, mensajería, bóveda de secretos (Azure Key Vault) y modelos de IA (Azure OpenAI). Región West US 3, Estados Unidos.",
        github: "GitHub (GitHub, Inc., filial de Microsoft): inicio de sesión, logs originales, fotos de perfil, la GitHub App y, si el repositorio lo usa, el reporte del diagnóstico. Estados Unidos.",
      },
      transfer: "Transferencia internacional. Como Pipesor y estos proveedores operan en Estados Unidos, usarlo implica un flujo transfronterizo de tus datos personales desde el Perú hacia ese país.",
      openai: "El modelo de IA lo opera Microsoft dentro de Azure. Según Microsoft, las instrucciones y las respuestas no están disponibles para OpenAI ni para otros proveedores de modelos.",
      abuse: "Azure OpenAI aplica la vigilancia de usos abusivos por defecto de Microsoft, que no hemos modificado: si sus sistemas automáticos marcan un contenido, Microsoft puede conservarlo dentro de la zona de datos de Estados Unidos y personal autorizado de Microsoft puede revisarlo. Microsoft no publica un plazo fijo de conservación para estos datos.",
      microsoft: "Microsoft: datos, privacidad y seguridad de Azure OpenAI",
    },
    retention: {
      title: "Conservación",
      table: {
        columns: { data: "Dato", period: "Plazo" },
        rows: {
          diagnoses: {
            data: "Extractos de log saneados, diagnósticos, evidencias y revisiones",
            period: "Hay una política documentada de 365 días, pero aún no se aplica: hoy ningún servicio borra estos datos.",
          },
          operational: {
            data: "Datos operativos: pipelines, permisos, incidentes y auditoría",
            period: "Se conservan sin plazo de eliminación.",
          },
          identity: {
            data: "Tu conexión con GitHub y su historial, y los intentos de inicio de sesión (con tu usuario)",
            period: "Sin plazo definido. Se conservan después de cerrar sesión.",
          },
          token: {
            data: "Tu token de GitHub, en Azure Key Vault",
            period: "Sin plazo definido. Cerrar sesión no lo borra; si se borrara, Key Vault lo conservaría 30 días más antes de eliminarlo definitivamente.",
          },
          messages: { data: "Mensajes internos entre servicios", period: "14 días." },
          serviceLogs: {
            data: "Logs técnicos de los servicios (identificadores y resultados, no contenido)",
            period: "30 días.",
          },
          accessLogs: { data: "Registros de acceso al dashboard (IP, fecha, página y navegador)", period: "30 días." },
          backups: { data: "Copias de seguridad de la base de datos", period: "7 días." },
          originalLogs: {
            data: "Logs originales",
            period: "No están en Pipesor. GitHub los conserva 90 días por defecto, según su propia política.",
          },
          report: {
            data: "Reporte del diagnóstico en GitHub (opcional)",
            period: "GitHub lo conserva el plazo que fije el repositorio (90 días por defecto).",
          },
        },
      },
    },
    rights: {
      title: "Tus derechos y cómo ejercerlos",
      text: "La Ley N.º 29733 te reconoce los derechos de información, acceso, rectificación, cancelación y oposición sobre tus datos personales.",
      manual: "Pipesor todavía no tiene un proceso automático para ejercerlos: no puedes borrar tu cuenta ni exportar tus datos desde la aplicación. Escribe a Pipesor Team (ver «Responsable y contacto») y atenderemos tu solicitud manualmente.",
      signOut: "Cerrar sesión también desconecta tu cuenta de GitHub de Pipesor: tu acceso se detiene hasta que vuelvas a iniciar sesión. Hoy no revoca tu autorización en GitHub ni borra el token guardado. Puedes revocar la autorización directamente en GitHub, en Settings → Applications → Authorized GitHub Apps.",
      revoke: "Authorized GitHub Apps en GitHub",
      authority: "Si consideras que tu solicitud no fue atendida, puedes presentar una reclamación ante la Autoridad Nacional de Protección de Datos Personales.",
    },
    ai: {
      title: "Datos e inteligencia artificial",
      model: "Los diagnósticos los genera GPT-6 Luna (versión 2026-09-22), consumido por la API de Azure OpenAI en la región West US 3 y en la modalidad Data Zone Standard: el procesamiento se mantiene dentro de la zona de datos de Estados Unidos.",
      receives: "Qué recibe el modelo: solo los extractos de log saneados, con la etapa en la que ocurrieron, y fragmentos de documentación técnica autorizada.",
      never: "Qué no recibe: logs completos, nombres de repositorio o de workflow, tu identidad, tokens ni datos de quienes revisan los diagnósticos.",
      noTraining: "Sin entrenamiento: no entrenamos ni ajustamos modelos, y tus revisiones no realimentan el modelo ni la base de conocimiento. La base de conocimiento solo cambia cuando el equipo importa documentación autorizada con una herramienta administrativa.",
      human: "Revisión humana: cada diagnóstico es una causa probable hasta que una persona lo valida. Ninguna recomendación se ejecuta automáticamente.",
      more: "Más detalles en Transparencia de la IA",
    },
    changes: {
      title: "Cambios en esta política",
      text: "Actualizaremos esta política cuando cambie el sistema, por ejemplo cuando empiece a aplicarse la política de conservación. La fecha de la última actualización figura al inicio.",
      consent: "Si un cambio afecta a las finalidades del tratamiento o a las transferencias, volveremos a pedir tu consentimiento.",
    },
  },
};

export const terms = {
  title: "Términos de uso",
  intro: {
    acceptance: "Al usar Pipesor aceptas estos términos. Si no estás de acuerdo con ellos, no uses Pipesor.",
  },
  sections: {
    nature: {
      title: "Qué es Pipesor",
      what: "Pipesor es el prototipo académico de una tesis de la Universidad Peruana de Ciencias Aplicadas (UPC). Es una plataforma AIOps: monitoriza workflows de GitHub Actions, captura las ejecuciones fallidas y genera un diagnóstico probable con un modelo de lenguaje, que luego valida una persona.",
      academic: "Pipesor no es un servicio comercial. Funciona en un entorno de desarrollo, sobre una suscripción académica de Azure.",
    },
    access: {
      title: "Cuentas y acceso",
      signIn: "Inicias sesión con tu cuenta de GitHub. Cualquier persona con cuenta de GitHub puede iniciar sesión, pero iniciar sesión no da acceso a ningún dato.",
      lead: "Solo verás un pipeline si se cumplen dos condiciones, que se comprueban en cada petición:",
      conditions: {
        grant: "tienes un permiso explícito en Pipesor (ver, operar o configurar); y",
        github: "puedes leer su repositorio en GitHub.",
      },
      noRole: "Ningún rol de GitHub concede permisos en Pipesor de forma automática. Quien configura un pipeline decide a quién da acceso. Si pierdes el acceso al repositorio en GitHub, pierdes también el acceso en Pipesor.",
      session: "Tu sesión dura como máximo una hora; después tendrás que volver a iniciar sesión. Pipesor no tiene autenticación multifactor propia: la seguridad de tu acceso depende de tu cuenta de GitHub.",
      age: "Para usar Pipesor debes tener 18 años o más.",
    },
    github: {
      title: "Acceso a GitHub",
      lead: "Un administrador del repositorio instala la GitHub App de Pipesor y registra los workflows que quiere monitorizar.",
      items: {
        readOnly: "La App tiene permisos mínimos de solo lectura (Actions y Metadata).",
        noChanges: "Pipesor no cambia código, workflows, secretos ni permisos.",
        token: "Tu token de GitHub se usa solo para leer, se guarda en Azure Key Vault y nunca llega a tu navegador.",
        excerpt: "De cada ejecución fallida, Pipesor toma un extracto de hasta 40 líneas del primer paso fallido y lo sanea. El log completo no se guarda en Pipesor; el original sigue en GitHub.",
        expired: "Si GitHub ya borró los logs de una ejecución, Pipesor no puede analizarla.",
        report: "Si el repositorio añade el workflow de reporte de Pipesor, ese workflow obtiene el diagnóstico con el token de identidad del propio GitHub Actions y lo guarda como artefacto de la ejecución fallida, donde puede leerlo quien vea los artefactos del repositorio.",
      },
      signOut: "Cerrar sesión desconecta tu cuenta de GitHub de Pipesor. Para revocar también la autorización que diste a la App, usa la configuración de GitHub (Settings → Applications → Authorized GitHub Apps).",
    },
    ai: {
      title: "Diagnósticos generados por IA",
      suggestion: "Cada diagnóstico es una sugerencia generada por IA. Incluye una causa probable, una comprobación manual recomendada, sus limitaciones y las evidencias y fuentes en que se apoya.",
      limits: "Un diagnóstico puede ser incorrecto o incompleto. El modelo solo ve un extracto de 40 líneas, el saneamiento puede eliminar datos útiles y el modelo no es determinista. Pipesor no muestra un porcentaje de confianza: la incertidumbre se describe en las limitaciones. Sin acceso a la base de conocimiento, no se genera diagnóstico.",
      human: "Todo diagnóstico requiere validación humana. Pipesor no ejecuta correcciones: registrar una remediación solo deja constancia del trabajo que hizo una persona. Validar un diagnóstico y resolver un incidente son procesos independientes; resolver exige una ejecución de verificación exitosa.",
    },
    responsibilities: {
      title: "Responsabilidades de las personas usuarias",
      lead: "Al usar Pipesor te comprometes a:",
      items: {
        authorized: "registrar solo workflows de repositorios que administras o para los que tienes autorización;",
        review: "revisar cada diagnóstico antes de actuar: las decisiones operativas son tuyas;",
        people: "no usar los diagnósticos ni los datos de los incidentes para evaluar el desempeño de personas;",
        access: "dar acceso solo a quien lo necesite;",
        reviewText: "no escribir datos personales ni confidenciales en el texto de las revisiones, que ve cualquier persona con acceso al pipeline junto con tu identificador;",
        logs: "evitar que tus logs contengan secretos o datos personales: el saneamiento reduce el riesgo, pero no lo elimina;",
        account: "proteger tu cuenta de GitHub;",
        abuse: "no intentar eludir los controles de acceso ni usar Pipesor de forma que afecte a otras personas usuarias.",
      },
    },
    availability: {
      title: "Disponibilidad y continuidad",
      noGuarantee: "Pipesor se ofrece sin garantía de disponibilidad ni de continuidad. El entorno puede interrumpirse o recrearse en cualquier momento, incluso sin aviso previo.",
      records: "No uses Pipesor como único registro de información importante. Los logs originales siguen en GitHub, sujetos a su política de conservación.",
    },
    ownership: {
      title: "Propiedad de los datos y repositorios",
      owners: "Los repositorios y su contenido pertenecen a sus titulares. Usar Pipesor no transfiere ningún derecho sobre ellos.",
      processing: "Pipesor solo procesa extractos saneados de los logs, con la única finalidad de diagnosticar fallos. El tratamiento de datos personales se describe en la Política de privacidad.",
      privacy: "Leer la Política de privacidad",
    },
    liability: {
      title: "Limitación de responsabilidad",
      asIs: "Pipesor es un prototipo académico y se ofrece tal como está, sin garantías sobre la exactitud de los diagnósticos, su disponibilidad o su idoneidad para un fin concreto.",
      limit: "En la medida en que lo permita la ley aplicable, Pipesor Team no responde por daños derivados de decisiones tomadas a partir de los diagnósticos, de interrupciones del servicio o de la pérdida de datos almacenados en Pipesor.",
      rights: "Nada en estos términos limita los derechos que la ley te reconoce y que no pueden limitarse por contrato.",
    },
    law: {
      title: "Ley aplicable y jurisdicción",
      governing: "Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia derivada de ellos o del uso de Pipesor se intentará resolver primero de buena fe escribiendo a Pipesor Team. Si no se resuelve en 30 días, las partes se someten a los jueces y tribunales del Cercado de Lima, Perú.",
      consumer: "Esto no limita los derechos que una norma imperativa te reconozca, incluido acudir a la Autoridad Nacional de Protección de Datos Personales, al INDECOPI u otra autoridad competente, o a los jueces de tu domicilio.",
      language: "Estos términos se publican en español e inglés. En caso de discrepancia, prevalece la versión en español.",
    },
    contact: {
      title: "Contacto y cambios",
      text: "Para cualquier consulta sobre estos términos, escribe a Pipesor Team:",
      changes: "Podemos actualizar estos términos cuando cambie el sistema. La fecha de la última actualización figura al inicio de esta página. Si sigues usando Pipesor después de un cambio, aceptas la nueva versión.",
    },
  },
};

export const standards = {
  title: "Alineación con estándares",
  intro: "Pipesor no está certificado en ningún estándar de inteligencia artificial, y su documentación técnica no se escribió a partir de ellos. Esta tabla muestra, práctica por práctica, qué principios de marcos reconocidos persiguen las decisiones de diseño descritas en esta página. Que una práctica se alinee con un principio no significa que Pipesor cumpla esa norma: indica que persigue el mismo objetivo. Las brechas conocidas figuran después de la tabla.",
  risk: "Según el Reglamento de la Ley N.º 31814, el equipo clasifica a Pipesor como un sistema de riesgo aceptable (art. 22.2): no es un uso indebido (art. 23) ni de riesgo alto (art. 24), y nunca actúa por su cuenta. Es la lectura del equipo, no una opinión legal.",
  editions: "Ediciones: Reglamento de la Ley N.º 31814, aprobado por el D. S. N.º 115-2025-PCM; ISO/IEC 42001:2023; ISO/IEC 23894:2023; NIST AI RMF 1.0 (NIST AI 100-1); OWASP Top 10 for LLM Applications 2025.",
  caption: "Prácticas de Pipesor y los principios con los que se alinean",
  columns: { practice: "Práctica de Pipesor", principle: "Principio o requisito", framework: "Marco", reference: "Referencia" },
  frameworks: {
    peru31814: "Reglamento de la Ley N.º 31814",
    iso42001: "ISO/IEC 42001",
    iso23894: "ISO/IEC 23894",
    nist: "NIST AI RMF",
    owasp: "OWASP Top 10 LLM 2025",
  },
  references: {
    control: "Anexo A, control {{id}}",
    annex: "Anexo A, {{id}}",
    clause: "Cláusula {{id}}",
  },
  articles: {
    oversight: "Art. 7, lit. h) «Supervisión humana»",
    transparency: "Art. 7, lit. i) «Transparencia»; art. 25 «Transparencia algorítmica»",
    accountability: "Art. 7, lit. j) «Rendición de cuentas»",
    security: "Art. 7, lit. e)",
    privacy: "Art. 7, lit. b); art. 26",
  },
  practices: {
    humanValidation: {
      text: "Toda salida es una causa probable hasta que una persona la valida (confirmar, corregir o rechazar)",
      principles: {
        oversight: "Supervisión humana",
        responsibleUse: "Procesos para el uso responsable de sistemas de IA",
        oversightProcesses: "Procesos de supervisión humana definidos y documentados",
      },
    },
    noAutomation: {
      text: "Ninguna recomendación se ejecuta automáticamente; la GitHub App solo tiene permisos de lectura",
      principles: {
        excessiveAgency: "Evitar la agencia excesiva (funciones, permisos y autonomía mínimos)",
        intendedUse: "Uso conforme al uso previsto del sistema",
      },
    },
    explained: {
      text: "Cada diagnóstico muestra causa probable, comprobación manual, limitaciones, evidencias y fuentes citadas",
      principles: {
        transparency: "Transparencia",
        documentation: "Documentación del sistema e información para las personas usuarias",
        explainability: "Transparencia y explicabilidad",
        interpreted: "Salida explicada e interpretada en su contexto",
      },
    },
    versions: {
      text: "La versión del modelo y de las instrucciones queda registrada en cada diagnóstico",
      principles: {
        eventLogs: "Registro de eventos del sistema de IA",
        accountability: "Transparencia y rendición de cuentas",
        peruAccountability: "Rendición de cuentas",
      },
    },
    noConfidence: {
      text: "No se calcula un porcentaje de confianza; la incertidumbre se declara en las limitaciones",
      principles: {
        knowledgeLimits: "Documentar los límites de conocimiento del sistema",
        misinformation: "Mitigar la desinformación y la dependencia excesiva de la salida",
      },
    },
    evidenceOnly: {
      text: "El modelo debe usar solo la evidencia aportada y tratarla como datos, no como instrucciones",
      principles: {
        injection: "Mitigar la inyección de instrucciones",
        security: "Seguridad, proporcionalidad y fiabilidad",
      },
    },
    strictOutput: {
      text: "La salida tiene validación estricta de formato; solo se citan las fuentes usadas",
      principles: {
        outputHandling: "Tratamiento adecuado de la salida",
        verification: "Verificación y validación del sistema de IA",
      },
    },
    sanitized: {
      text: "El log se sanea antes de cualquier procesamiento con IA; el modelo no recibe logs completos, nombres de repositorio, identidades ni tokens",
      principles: {
        privacy: "Privacidad de los datos personales",
        preparation: "Preparación de datos",
        privacyRisk: "Privacidad",
        privacyExamined: "Examen y documentación del riesgo de privacidad",
        disclosure: "Evitar la divulgación de información sensible",
      },
    },
    noTraining: {
      text: "No se entrenan ni ajustan modelos; las revisiones no realimentan el modelo ni el corpus de recuperación",
      principles: {
        poisoning: "Prevenir el envenenamiento de datos y modelos",
        dataManagement: "Gestión de los datos para el desarrollo y la mejora del sistema",
      },
    },
    corpus: {
      text: "El corpus de recuperación es solo documentación técnica autorizada (22 documentos, 33 fragmentos), separada del material de evaluación",
      principles: {
        provenance: "Procedencia de los datos",
        testData: "Disponibilidad y calidad de los datos de prueba",
        vectors: "Proteger el almacén vectorial y el contenido recuperado",
      },
    },
    evaluation: {
      text: "Evaluación publicada: 17 de 20 (85 %), intervalo de Wilson al 95 % de 64 %–95 %, con sus revisores y limitaciones declarados",
      principles: {
        validity: "Demostrar validez y fiabilidad, y documentar los límites de generalización",
        verification: "Verificación y validación del sistema de IA",
        reporting: "Registro e informe del proceso de riesgo",
      },
    },
    limitations: {
      text: "Se publican las limitaciones conocidas: extracto de 40 líneas, saneamiento, dependencia de la recuperación, no determinismo, logs borrados y el alcance de los repositorios de validación",
      principles: {
        identification: "Identificación de riesgos",
        knowledgeLimits: "Documentar los límites de conocimiento del sistema",
      },
    },
    suppliers: {
      text: "Modelos de terceros consumidos por API (Azure OpenAI, West US 3), con el modelo, su versión y la región identificados",
      principles: {
        supplierManagement: "Gestión de proveedores",
        thirdParty: "Seguimiento de riesgos de recursos de terceros",
        supplyChain: "Riesgos de la cadena de suministro",
      },
    },
  },
  gaps: {
    title: "Brechas conocidas",
    items: {
      rateLimit: "No hay límite de peticiones por usuario, así que todavía no se alinea con OWASP LLM10:2025 Unbounded Consumption.",
      retention: "La política de conservación de 365 días está documentada, pero no se aplica.",
      reviewers: "La evaluación usó un solo revisor por caso, y los revisores fueron los propios autores del sistema.",
    },
  },
};
