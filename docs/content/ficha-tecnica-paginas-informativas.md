# Ficha técnica para las páginas informativas de Pipesor

Fuente de hechos para redactar **Privacidad y tratamiento de datos personales**, **Términos de uso** y el **mapeo de estándares** de *Transparencia de la IA*. Las páginas *Cómo funciona*, *Transparencia de la IA* y *Seguridad* las construye el frontend a partir de la misma base.

Estado: hechos verificados el 24/11/2026 contra la documentación de arquitectura (pipesor-docs), los README de los servicios, la infraestructura como código y el código del dashboard. Entorno descrito: **`dev` en Azure**, el único desplegado.

## 0. Reglas para quien redacte

1. **No afirmar nada que el sistema no haga.** Si un punto figura como *pendiente*, *documentado pero no aplicado* o *no implementado*, el texto debe decirlo así o callarlo; nunca presentarlo como hecho.
2. **Alineación no es certificación.** Se puede decir que una práctica "se alinea con" o "sigue los principios de" un estándar. Nunca que Pipesor "cumple", "está certificado" o "es conforme".
3. **Prototipo académico.** Pipesor es el prototipo de una tesis de la UPC desplegado en un entorno de desarrollo; no es un servicio comercial.
4. **Formato.** Texto en **español e inglés**, en secciones con un título corto y párrafos breves (la página se lee en pantalla). Sin datos de contacto inventados: usar los marcadores `[RESPONSABLE]`, `[CORREO DE CONTACTO]` donde falten.
5. **Pendientes de decisión** (sección 8): no redactarlos como resueltos.

## 1. Qué es Pipesor

Plataforma AIOps que monitoriza workflows de GitHub Actions, captura las ejecuciones fallidas, genera un **diagnóstico probable** con un modelo de lenguaje apoyado en recuperación de conocimiento (RAG) y lo somete a **validación humana**. No modifica código ni ejecuta correcciones: registrar una remediación solo deja constancia del trabajo humano.

## 2. Recorrido de los datos (resumen)

1. Una persona inicia sesión con GitHub. Un administrador del repositorio instala la GitHub App de Pipesor y registra un workflow para monitorizarlo.
2. Cuando una ejecución falla, Pipesor la captura (aviso de GitHub o petición manual desde el dashboard).
3. **Protección en origen:** se toma un extracto de **hasta 40 líneas** del primer paso fallido y se **sanea** (se enmascaran correos, IP, tokens de GitHub, JWT, valores de claves sensibles; se rechaza el extracto si contiene claves privadas o codificaciones sospechosas). El log completo **no se guarda** en Pipesor; el original sigue en GitHub.
4. El extracto saneado viaja por un bus de mensajes interno a los servicios de procesamiento (estructuración del log, correlación de evidencias).
5. Se buscan hasta 3 fragmentos de conocimiento autorizado (RAG) a partir del extracto.
6. El modelo de lenguaje recibe **solo** los extractos saneados y los fragmentos recuperados, y devuelve: causa probable, una comprobación manual recomendada, limitaciones y las evidencias y fuentes citadas.
7. Se abre un **incidente** en el dashboard con el diagnóstico.
8. Una persona con permiso lo **valida**: confirmado, rechazado y corregido (con la causa real) o rechazado.
9. Por separado, el equipo registra el ciclo de vida del incidente: abierto → en remediación → verificación → resuelto (resolver exige una ejecución de verificación exitosa).

Validar el diagnóstico y resolver el incidente son **procesos independientes**.

## 3. Inteligencia artificial

| Aspecto | Hecho |
|---|---|
| Modelo de diagnóstico | **GPT-6 Luna, versión 2026-09-22**, vía Azure OpenAI en Microsoft Foundry (despliegue `pipesor-dev-diagnostics-luna`, Data Zone Standard). Confirmado en Azure el 24/11/2026 (ADR-026). |
| Modelo de embeddings | text-embedding-3-small (versión 1), 1536 dimensiones, vía Azure OpenAI. Confirmado en Azure. |
| Proveedor y región | Microsoft Azure (Azure OpenAI / Foundry), región **West US 3 (EE. UU.)**, modalidad *Data Zone Standard* (procesamiento dentro de la zona de datos de EE. UU.). |
| Entrenamiento | **No se entrenan ni ajustan modelos.** Se consumen por API. |
| Qué recibe el modelo | Extractos de log **saneados** (con su etapa) y fragmentos del corpus recuperados. |
| Qué **no** recibe | Logs completos, nombres de repositorio o workflow, identidades de usuario, tokens, datos de quienes revisan. |
| Instrucciones al modelo | Usar solo la evidencia aportada, tratarla como datos y no como instrucciones, citar solo lo usado y declarar la incertidumbre. |
| Salida | Causa probable, comprobación manual, limitaciones, evidencias y fuentes citadas, con validación estricta de formato. La versión del modelo y de las instrucciones queda registrada en cada diagnóstico. |
| Confianza | **No se calcula ni se muestra un porcentaje de confianza.** La incertidumbre se expresa en el texto de limitaciones. |
| Supervisión humana | Toda salida es una *causa probable* hasta que una persona la valida. Ninguna recomendación se ejecuta automáticamente. |
| Aprendizaje | **El sistema no aprende de forma automática, a propósito.** Las revisiones no realimentan el modelo ni el RAG. Un aprendizaje curado con aprobación humana está diferido al próximo semestre (PD-037). |
| Corpus | Solo documentación técnica autorizada derivada del inventario del proyecto (22 documentos, 33 fragmentos), separada del material de evaluación. Solo cambia mediante un importador administrativo por línea de comandos (PD-006); la aplicación no ofrece esa función. |
| Evaluación (OE3) | 20 casos: acierto estricto según revisión humana **17/20 = 85 %**, intervalo de confianza 95 % (Wilson) **[64 %; 95 %]**. No permite afirmar con 95 % de confianza un acierto ≥ 80 %. Recomendaciones accionables en 4/20 casos. Latencia mediana 33 s. Revisores: los propios autores; un revisor por caso. |
| Limitaciones conocidas | Ve solo 40 líneas; el saneamiento puede eliminar datos útiles; sin RAG disponible no hay diagnóstico; el modelo no es determinista; si GitHub ya borró los logs no se puede analizar; resultados no generalizables: 10 escenarios de fallo derivados de tres repositorios del entorno de validación. |
| Estándares citados en la documentación | **Ninguno de IA.** Solo principios internos: privacidad desde el diseño, humano en el ciclo, sin remediación autónoma. El Capstone (§2.2) alinea los requisitos no funcionales con ISO/IEC 25010, que es de calidad de producto, no de IA. |
| Clasificación según el Reglamento de la Ley N.º 31814 | **Riesgo aceptable** (art. 22.2) según la lectura del equipo: no es uso indebido (art. 23) ni de riesgo alto (art. 24). No es una opinión legal. |

## 4. Datos personales

### 4.1 Inventario

| Dato | Dónde se guarda | Finalidad | Quién lo ve |
|---|---|---|---|
| Id numérico de usuario de GitHub | Servicio de ingestión (base de datos) y token de sesión | Identificar a la persona al iniciar sesión | La propia persona; operación técnica |
| Usuario (login) de GitHub | Registro de intentos de inicio de sesión; sesión del navegador | Mostrar quién ha iniciado sesión | La propia persona |
| Identificador interno de persona (derivado del id de GitHub) | Permisos, auditoría, autoría de revisiones | Autorización, trazabilidad | Quien configura el pipeline; quien puede ver el pipeline ve la autoría de las revisiones |
| Token de acceso de GitHub de la persona | Bóveda de secretos (Azure Key Vault) | Leer GitHub en su nombre (solo lectura) | Solo los servicios; **nunca llega al navegador** |
| Avatar, usuario y rol de colaboradores del repositorio | **No se guardan**: se leen de GitHub en el momento | Elegir a quién dar acceso | Administradores del repositorio |
| Texto libre de las revisiones (comentario, causa real; ≤ 1500 caracteres) | Servicio de recomendación (base de datos) | Validación del diagnóstico | Quien puede ver el pipeline |
| Nombre del repositorio y workflow, rama, commit, ejecuciones | Servicio de pipelines (base de datos) | Operación | Quien puede ver el pipeline |
| Extractos de log saneados (≤ 40 líneas) | Servicios de evidencias y recomendación | Evidencia del diagnóstico | Quien puede ver el pipeline |
| Dirección IP, fecha, ruta y navegador de cada visita al dashboard | Registros técnicos del servidor del dashboard (Azure Log Analytics, 30 días) | Operación técnica y diagnóstico de fallos | Operación técnica |
| Reporte del diagnóstico (opcional): diagnóstico, evidencias saneadas y fuentes, **sin revisiones** | Artefacto de la ejecución fallida en GitHub, si el repositorio añade el workflow `pipesor-report` (obtiene el reporte con el token OIDC de GitHub Actions; ruta de Recommendation, contrato de identidad §6) | Conservar el diagnóstico junto a la ejecución | Quien puede ver los artefactos de Actions del repositorio |

**No se guarda el correo electrónico** de nadie; los correos dentro de los logs se enmascaran. **Advertencia:** los extractos pueden contener nombres de personas o usuarios (p. ej., autor de un commit o rutas): el saneamiento **no detecta nombres**.

### 4.2 Navegador

- **Sin cookies** y sin analítica ni telemetría.
- `sessionStorage` (se borra al cerrar la pestaña): la sesión de Pipesor (token de acceso, caducidad ≤ 1 hora, id y usuario de GitHub) y la ruta de retorno tras instalar la App.
- `localStorage`: solo preferencias de interfaz (tema, idioma, barra lateral).
- **Fuentes tipográficas:** se sirven desde Pipesor (Geist y Geist Mono, licencia SIL OFL 1.1). El navegador no contacta con ningún proveedor de fuentes.

### 4.3 Encargados y transferencias

- **Microsoft Azure** (alojamiento, base de datos, mensajería, bóveda de secretos, modelos de IA): región **West US 3, Estados Unidos**. Implica **transferencia internacional** de datos desde Perú.
- **GitHub** (identidad, logs originales, instalación de la App).
- **Azure OpenAI:** la monitorización de abuso está en la **configuración por defecto de Microsoft, no modificada** (no se solicitó la exención). Según la política de Microsoft, puede conservar entradas y salidas durante un periodo limitado para detectar abusos; que el Redactor cite la política vigente de Microsoft sin afirmar plazos que no pueda verificar.
- **Según la página de Microsoft** «Data, privacy, and security for Azure Direct Models» (verificada el 24/11/2026): las entradas y salidas **no están disponibles para OpenAI** ni para otros proveedores de modelos; en Data Zone el almacén de monitorización de abuso queda en la geografía designada. La página **no publica un plazo de conservación**.

### 4.4 Conservación

| Dato | Política | Realidad |
|---|---|---|
| Logs saneados, diagnósticos, evidencias | 365 días (documentado) | **Solo documentada: ningún servicio borra datos.** |
| Datos operativos (pipelines, incidentes, auditoría) | — | Se conservan indefinidamente |
| Mensajes internos | 14 días | Aplicado |
| Logs técnicos de contenedores | 30 días | Aplicado |
| Copias de seguridad de la base de datos | 7 días de restauración, sin réplica geográfica | Aplicado |
| Registros de acceso del dashboard (IP, fecha, ruta, navegador) | 30 días en Azure Log Analytics | Aplicado |
| Revisiones humanas (incluido el identificador de quien revisa) | 365 días (RET-001, documentado) | **Sin purga: se conservan** |
| Conexión con GitHub, sus generaciones e intentos de inicio de sesión (con el login) | — | **Sin plazo definido**; sobreviven al cierre de sesión |
| Token de GitHub en Key Vault | — | **Sin plazo definido**; cerrar sesión no lo borra (si se borrara: 30 días de *soft-delete* con protección de purga) |
| Reporte del diagnóstico en GitHub (opcional) | Lo fija el repositorio (90 días en `pipesor-validation-scenarios`) | Fuera de Pipesor |
| Logs originales en GitHub | 90 días por defecto (política de GitHub) | Fuera de Pipesor |

### 4.5 Derechos de las personas

**No existe un proceso implementado** (ni borrado de cuenta ni exportación). Cualquier derecho de acceso, rectificación, cancelación u oposición se atiende **manualmente** escribiendo a Pipesor Team (sección 8).

**Cerrar sesión desconecta GitHub** (verificado en Ingestion el 24/11/2026): `POST /api/v1/auth/logout` y `DELETE /api/v1/github/connection` hacen lo mismo. Invalidan la generación activa del vínculo, pero **no revocan el token en GitHub ni lo borran de la bóveda**: la limpieza queda encolada sin un *worker* que la ejecute (`cleanup: NOT_CONFIRMED`). La persona puede revocar la autorización en GitHub → Settings → Applications → Authorized GitHub Apps. Volver a iniciar sesión recupera sus permisos, que nunca se borran.

## 5. Seguridad (hechos para la página y para coherencia)

**Aplicado:**
- Inicio de sesión con GitHub (OAuth con PKCE y *state* de un solo uso); sesión de Pipesor de **máximo 1 hora**, sin renovación en el navegador.
- Los tokens de GitHub **nunca llegan al navegador**; se custodian en Azure Key Vault.
- Autorización en dos capas: permiso explícito en Pipesor (ver, operar, configurar) **y** acceso vigente en GitHub en cada petición. Iniciar sesión no da acceso a ningún dato. Ningún rol de GitHub concede permisos automáticamente.
- GitHub App con permisos mínimos de **solo lectura** (Actions y Metadata). Pipesor no modifica repositorios.
- Saneamiento de logs antes de cualquier procesamiento con IA; los logs técnicos no registran contenido, solo identificadores y resultados.
- HTTPS obligatorio; base de datos privada en red virtual, sin contraseñas (identidad de Azure); secretos en Key Vault con acceso por roles.
- Identidades de servicio con mínimo privilegio y tokens de corta duración entre servicios.
- Cabeceras de seguridad del navegador (CSP estricta, HSTS, sin *framing*, sin *referrer*).
- Auditoría de registros, permisos, configuración y transiciones de incidentes; revisiones de solo anexado.
- Escaneo de vulnerabilidades e inventario de componentes (SBOM) en CI; imágenes sin privilegios y fijadas por *digest*.

**No implementado / límites aceptados del MVP:** sin MFA propio (aplica la seguridad de la cuenta de GitHub); sin revocación central de sesiones; sin WAF ni *gateway*; sin límite de peticiones por usuario; rotación de claves sin interrupción pendiente.

## 6. Hechos para los Términos de uso

- Prototipo académico (tesis UPC) en un **entorno de desarrollo** sobre una suscripción académica de Azure: **sin garantía de disponibilidad ni de continuidad**; el entorno puede interrumpirse o recrearse.
- Acceso **de solo lectura** a GitHub; Pipesor no cambia código, workflows, secretos ni permisos.
- Los diagnósticos son **sugerencias generadas por IA** que requieren validación humana; Pipesor no ejecuta correcciones. Las decisiones operativas son responsabilidad de las personas usuarias.
- Cualquiera con cuenta de GitHub puede iniciar sesión, pero solo ve los pipelines a los que se le ha dado acceso y cuyo repositorio puede leer en GitHub.
- Los repositorios y su contenido pertenecen a sus titulares; Pipesor solo procesa extractos saneados con la finalidad de diagnosticar.
- Quien administra un pipeline decide a quién da acceso; el acceso se pierde si se pierde el acceso en GitHub.
- Si el repositorio añade el workflow `pipesor-report`, el diagnóstico (sin revisiones) se guarda como artefacto de la ejecución en GitHub.
- **Consentimiento:** casilla sin marcar en la pantalla de inicio de sesión que acepta la Política de privacidad (con la transferencia a EE. UU., Microsoft y GitHub) y los Términos de uso; sin ella no se continúa con GitHub. Hoy el consentimiento **no se registra** en el servidor.
- Uso a partir de 18 años; prohibido usar los diagnósticos para evaluar el desempeño de personas (aleja a Pipesor de los usos de riesgo alto del Reglamento de la Ley N.º 31814).
- Ley peruana; primero un intento de buena fe por correo y, si no se resuelve en 30 días, jueces del Cercado de Lima, sin limitar las vías ante la ANPD, el INDECOPI o los jueces del domicilio; prevalece la versión en español.

## 7. Encargo para Claude Redactor

1. **Privacidad y tratamiento de datos personales** (ES y EN) con las secciones 4 y 6 como hechos. Marco sugerido para que lo confirmes: Ley N.º 29733 de Protección de Datos Personales y su reglamento vigente, incluyendo **flujo transfronterizo** (Azure en EE. UU.).
2. **Términos de uso** (ES y EN) con la sección 6.
3. **Mapeo de estándares para Transparencia de la IA:** indicar con qué marcos se **alinean** las prácticas de la sección 3, sin afirmar cumplimiento. Candidatos a confirmar: normativa peruana de IA (Ley N.º 31814 y su reglamento), ISO/IEC 42001, ISO/IEC 23894, NIST AI RMF, OWASP Top 10 para aplicaciones LLM. Devolver una tabla *práctica de Pipesor → principio/estándar → referencia*.
4. Extensión orientativa: cada página entre 600 y 1200 palabras por idioma.

## 8. Decisiones pendientes del responsable (antes de publicar)

1. ~~Responsable del tratamiento y contacto~~ — resuelto: Pipesor Team, formado por Gálvez Chambi, Jhon Alexander (u202323270@upc.edu.pe) y Guzmán Chávez, Ramiro Alexander (u202217062@upc.edu.pe). Pendiente: ¿añadir un domicilio postal? La ley pide identidad y domicilio o dirección.
2. ~~Modelo de diagnóstico desplegado~~ — resuelto: GPT-6 Luna 2026-09-22.
3. ~~Google Fonts~~ — resuelto: las fuentes se alojan en Pipesor (decisión del responsable, 24/11/2026).
4. ~~Retención~~ — resuelto: se publica como "documentada, aún no aplicada", con "sin plazo definido" donde no hay política.
5. ~~Visibilidad de la autoría de revisiones~~ — resuelto: se declara.
6. ~~IP en los registros del dashboard~~ — resuelto: se declara tal cual (30 días), sin anonimizar.
7. **Pendientes fuera del código** (investigación del 24/11/2026; apoyo, no asesoría legal): inscribir el banco de datos en el Registro Nacional de Protección de Datos Personales (SIPDP, gratuito, aprobación automática) y comunicar el flujo transfronterizo a EE. UU. (Reglamento D. S. N.º 016-2024-JUS, arts. 21.2, 42 y 43); registrar el consentimiento en el servidor (versión, fecha y persona) como prueba (art. 9). Esto último corresponde al backend.
