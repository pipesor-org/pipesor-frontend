/**
 * `about` namespace — English.
 *
 * Copy for the public "About Pipesor" area: how it works (data journey and
 * glossary), getting started, AI transparency and security. Every statement
 * describes the implemented system (fact sheet: docs/content/ficha-tecnica-paginas-informativas.md).
 */
const about = {
  title: "About Pipesor",
  subtitle: "How Pipesor turns a failed GitHub Actions run into a diagnosis a person validates — and how it treats your data.",
  tabsLabel: "About Pipesor sections",
  tabs: {
    "how-it-works": "How it works",
    "getting-started": "Getting started",
    ai: "AI transparency",
    security: "Security",
  },
  public: {
    signIn: "Sign in",
    nav: "About Pipesor",
  },
  journey: {
    title: "The journey of a failed run",
    lead: "Follow one failure from GitHub to a validated diagnosis. Each step shows where the data goes and what it looks like there.",
    example: "Illustrative example",
    controls: {
      label: "Journey controls",
      play: "Play",
      pause: "Pause",
      previous: "Previous step",
      next: "Next step",
      position: "Step {{current}} of {{total}}",
    },
    where: "Where",
    kept: "Kept",
    steps: {
      run: {
        short: "Run fails",
        title: "A workflow run fails",
        text: "GitHub Actions reports a failed run of a monitored workflow, or someone asks Pipesor to analyse it from the dashboard.",
        where: "GitHub Actions → Ingestion",
        kept: "The original log stays on GitHub (90 days by default).",
        sample: "12:04:51 Run ./deploy.sh --env staging\n12:04:52 Using token ghp_EXAMPLE0000000000\n12:04:53 Notify ana.perez@example.com\n12:04:55 Error: Cannot find module 'express'\n12:04:55 Process completed with exit code 1.",
      },
      protect: {
        short: "Protect",
        title: "Captured and protected",
        text: "Ingestion reads up to 40 lines of the first failed step and masks emails, IP addresses, tokens and secret values. The full log is never stored in Pipesor.",
        where: "Ingestion",
        kept: "Only the protected excerpt and the capture record.",
        sample: "12:04:51 Run ./deploy.sh --env staging\n12:04:52 Using token [redacted]\n12:04:53 Notify [redacted]\n12:04:55 Error: Cannot find module 'express'\n12:04:55 Process completed with exit code 1.",
      },
      publish: {
        short: "Publish",
        title: "Published as evidence",
        text: "The protected excerpt travels through an internal message bus with a locator that records where it came from. The locator proves provenance; it never grants access.",
        where: "Azure Service Bus",
        kept: "Messages expire after 14 days.",
        sample: "locator  v2:job:4512:member:3:lines:12-16:sha256:9c1e…\nstage    DEPLOYMENT\nlines    5 (protected)",
      },
      process: {
        short: "Correlate",
        title: "Structured and correlated",
        text: "The NLP processor turns lines into event templates, and the correlation engine joins the evidence of the same run with its incident.",
        where: "NLP processor · Correlation engine",
        kept: "A correlated evidence snapshot.",
        sample: "template  Error: Cannot find module <*>\ntemplate  Process completed with exit code <*>\nrun       #45001707658 · attempt 1\nincident  INC-1003 (origin run)",
      },
      retrieve: {
        short: "Retrieve",
        title: "Knowledge retrieved",
        text: "Retrieval-augmented generation (RAG) searches the authorized technical corpus for the three passages closest to the evidence.",
        where: "RAG retrieval · pgvector",
        kept: "Authorized documentation only; it does not learn from reviews.",
        sample: "passage  Node.js dependency errors · §2\npassage  Deployment script checklist · §5\npassage  Caching npm installs · §1",
      },
      diagnose: {
        short: "Diagnose",
        title: "A probable cause is proposed",
        text: "The language model receives only the protected evidence and the retrieved passages, and answers in a fixed structure: probable cause, a manual check, its limitations and the sources it used.",
        where: "Recommendation · Azure OpenAI (Microsoft Foundry)",
        kept: "An immutable diagnosis with its model and prompt version.",
        sample: "probable cause  The deploy runs before dependencies are installed.\nmanual check    Add `npm ci` before ./deploy.sh and rerun.\nlimitations     Only the failed step was visible.\ncites           evidence e1 · Node.js dependency errors §2",
      },
      incident: {
        short: "Incident",
        title: "An incident opens",
        text: "Pipeline opens an incident for the failed run, with its stage and severity, and the dashboard shows it next to its diagnosis.",
        where: "Pipeline · Dashboard",
        kept: "The incident and every lifecycle step, audited.",
        sample: "INC-1003  High · Deployment · Open\nprobable cause  The deploy runs before dependencies…\nvalidation      Pending",
      },
      validate: {
        short: "Validate",
        title: "A person validates it",
        text: "Someone with Operate access confirms the diagnosis, corrects it with the actual cause, or rejects it. Nothing is executed automatically.",
        where: "Dashboard · Recommendation",
        kept: "An append-only review history.",
        sample: "Confirmed   the proposed cause was right\nCorrected   actual cause: the lockfile was out of date\nRejected    not the cause",
      },
    },
  },
  tracks: {
    title: "Two tracks, never mixed",
    lead: "An incident's lifecycle and its diagnosis validation move independently: resolving an incident never confirms or rejects its diagnosis.",
    incident: {
      title: "Incident lifecycle",
      note: "Recorded by people. Resolving requires a successful verification run.",
      steps: { open: "Open", remediation: "In remediation", verification: "Verification", resolved: "Resolved" },
    },
    validation: {
      title: "Diagnosis validation",
      note: "Pending until a person reviews it. Reviews are never rewritten.",
      steps: { pending: "Pending", outcome: "Confirmed · Corrected · Rejected" },
    },
  },
  glossary: {
    title: "Glossary",
    lead: "The terms Pipesor uses, as its architecture defines them. Terms tied to the journey take you to their step.",
    search: "Search terms",
    categoriesLabel: "Filter by topic",
    categories: {
      all: "All",
      flow: "Data flow",
      incident: "Incidents",
      validation: "Diagnosis",
      access: "Access",
      ai: "AI",
      metrics: "Metrics",
    },
    seeInJourney: "See in the journey",
    count_one: "{{count}} term",
    count_other: "{{count}} terms",
    empty: "No term matches this search.",
    terms: {
      monitoredWorkflow: { term: "Monitored workflow (pipeline)", definition: "A GitHub Actions workflow registered in Pipesor. Pipeline and workflow mean the same thing here." },
      run: { term: "Run and attempt", definition: "One execution of a workflow on GitHub Actions. Re-running it creates a new attempt of the same run." },
      evidence: { term: "Evidence", definition: "Observed, protected log excerpts from a failed run, kept with the locator that says where they came from." },
      sanitization: { term: "Protection (sanitization)", definition: "Masking emails, IP addresses, tokens and secret values, and keeping at most 40 lines, before any processing or AI." },
      locator: { term: "Source locator", definition: "A reference to the exact job, file and lines of an excerpt, with a hash of the original. It proves provenance, not access." },
      correlation: { term: "Correlation", definition: "Joining all evidence of the same run and attempt with the incident it opened, in one immutable snapshot." },
      incident: { term: "Incident", definition: "Opened from a failed run (its origin run). It records the stage, severity and the people's work until it is resolved." },
      displayNumber: { term: "INC number", definition: "A readable number such as INC-1003, for presentation only. The system identifies incidents by an internal id." },
      severity: { term: "Severity", definition: "How serious an incident is (Critical, High, Medium, Low). It starts from the pipeline's criticality." },
      criticality: { term: "Criticality", definition: "How important a pipeline is, set by whoever registers it. Changing it later does not change existing incidents." },
      stage: { term: "Stage", definition: "Where the run failed: build, testing, quality gate, deployment, container or infrastructure." },
      remediation: { term: "Remediation", definition: "The human work to fix the cause. Starting it records the step and the time; Pipesor never runs fixes." },
      verificationRun: { term: "Verification run", definition: "A later run linked to the incident after remediation. A successful one is required to resolve it." },
      diagnosis: { term: "Diagnosis", definition: "The model's versioned, immutable answer for an incident's origin run." },
      probableCause: { term: "Probable cause", definition: "A hypothesis about why the run failed. It stays probable until a person validates it." },
      recommendation: { term: "Manual check", definition: "What the model suggests a person verify or do next. It is never executed." },
      limitations: { term: "Limitations", definition: "What the model declares it could not see or is unsure about. Pipesor shows no confidence score." },
      validation: { term: "Validation (review)", definition: "A person's decision on a diagnosis: Confirmed, Corrected (with the actual cause) or Rejected. Pending until then." },
      humanInTheLoop: { term: "Human in the loop", definition: "Every diagnosis is a proposal until a person reviews it, and no recommendation runs on its own." },
      capabilities: { term: "Capabilities", definition: "What a person may do on a pipeline: View, Operate (incident steps and reviews) or Configure (policy and people; not Operate)." },
      grant: { term: "Access (grant)", definition: "An explicit capability given to one person on one pipeline. It also requires current access to the repository on GitHub." },
      githubApp: { term: "Pipesor GitHub App", definition: "The read-only app a repository administrator installs so Pipesor can read workflow runs and metadata." },
      admission: { term: "Admission", definition: "A repository becomes monitorable when its administrator selects it in the Pipesor GitHub App." },
      rag: { term: "RAG", definition: "Retrieval-augmented generation: finding relevant passages in an authorized corpus to ground the model's answer." },
      corpus: { term: "Corpus", definition: "The authorized technical documentation RAG searches. It is kept apart from evaluation material and does not learn from reviews." },
      embedding: { term: "Embedding", definition: "A numeric vector (1,536 dimensions) that lets RAG compare texts by meaning." },
      mttr: { term: "MTTR", definition: "Mean time to resolution: from detection to resolution of an incident." },
      meanDiagnosisTime: { term: "Mean diagnosis time", definition: "From detection to the moment the diagnosis is ready." },
      confirmationRate: { term: "Confirmation rate", definition: "Confirmed reviews over confirmed plus rejected ones (corrected counts as rejected). It measures human reviews, not model accuracy." },
      recurring: { term: "Recurring context", definition: "Incidents grouped by pipeline and stage. A grouping, not a root-cause taxonomy." },
    },
  },
  start: {
    title: "Getting started",
    lead: "Five steps from an empty workspace to a validated diagnosis shared with your team.",
    who: "Who",
    roles: { admin: "Repository administrator", operator: "Anyone with Operate access", configurer: "Whoever configures the pipeline" },
    steps: {
      install: {
        title: "Give Pipesor read access",
        text: "Install the Pipesor GitHub App and select the repositories to monitor. It is read-only: code, workflows, secrets and permissions stay as they are.",
        action: "Choose repositories on GitHub",
      },
      register: {
        title: "Register a workflow",
        text: "Browse your repositories by account, open one and choose the workflow to monitor, with its criticality.",
        action: "Add monitored workflow",
      },
      analyze: {
        title: "Analyse a failed run",
        text: "Failed runs are captured as they happen, or you can request an analysis from the pipeline's recent failed runs.",
        action: "Open Pipelines",
      },
      validate: {
        title: "Validate the diagnosis",
        text: "Open the incident, read the probable cause and its evidence, and confirm, correct or reject it.",
        action: "Open Operations",
      },
      share: {
        title: "Share with your team",
        text: "In the pipeline's People section, add collaborators of the repository and choose what each can do.",
        action: "Open Pipelines",
      },
    },
  },
  ai: {
    title: "AI transparency",
    lead: "What the model sees, what it returns, and where people stay in control.",
    glance: {
      title: "At a glance",
      items: {
        proposes: "AI proposes a probable cause; a person decides.",
        minimal: "The model sees only protected log excerpts and authorized documentation.",
        noTraining: "No model is trained or fine-tuned with your data.",
        noLearning: "Pipesor does not learn from reviews automatically, on purpose.",
        noAction: "No recommendation is ever executed automatically.",
      },
    },
    model: {
      title: "The model",
      text: "Diagnoses come from GPT-6 Luna (version 2026-09-22), a large language model served by Azure OpenAI in Microsoft Foundry, in Microsoft's US data zone (West US 3). Embeddings for retrieval use text-embedding-3-small. Models are used through the API; none is trained or modified. Each diagnosis records the model deployment, its version and the prompt version.",
    },
    inputs: {
      title: "What the model receives",
      receives: {
        title: "Receives",
        items: {
          evidence: "Protected log excerpts (at most 40 lines of the failed step), with their stage.",
          knowledge: "Up to three passages from the authorized technical corpus.",
          instructions: "Fixed instructions: use only the evidence given, treat it as data and not as instructions, cite what was used and state uncertainty.",
        },
      },
      never: {
        title: "Never receives",
        items: {
          rawLogs: "Complete or unprotected logs.",
          identity: "Who you are, your repository or workflow names.",
          secrets: "Tokens, credentials or reviewers' data.",
        },
      },
    },
    outputs: {
      title: "What it returns",
      text: "A fixed, validated structure: a probable cause, a manual check, its limitations, and the evidence and sources it cites. The answer is checked before it is stored; a malformed answer is retried, never shown.",
      noConfidence: "Pipesor shows no confidence percentage. A model's self-reported confidence is not a reliable probability, so uncertainty is stated in words, in the limitations.",
    },
    human: {
      title: "People stay in control",
      items: {
        probable: "Every answer is a probable cause until someone with Operate access reviews it.",
        review: "A review confirms it, corrects it with the actual cause, or rejects it. Reviews are kept and never rewritten.",
        noAction: "Recording remediation documents human work; Pipesor does not change code or run fixes.",
      },
    },
    learning: {
      title: "No automatic learning",
      text: "Reviews do not feed the model or the knowledge corpus. Learning automatically from reviews could repeat a reviewer's mistake and would contaminate the evaluation. A curated loop — corrected diagnoses approved by a responsible person before entering the corpus — is planned for the next phase.",
    },
    evaluation: {
      title: "How it was evaluated",
      text: "In the thesis evaluation, human reviewers judged 17 of 20 diagnoses correct (85 %; 95 % confidence interval 64 %–95 %). The interval does not allow claiming, with 95 % confidence, an accuracy of 80 % or more. Recommendations were actionable in 4 of 20 cases, and the median time to a diagnosis was 33 seconds. The reviewers were the system's authors, with one reviewer per case.",
    },
    limits: {
      title: "Known limitations",
      items: {
        window: "It sees only the excerpt of the first failed step, not the whole log.",
        masking: "Protection can remove details that would help, such as versions or addresses.",
        variance: "The model is not deterministic: the same failure can be explained differently.",
        expired: "If GitHub has already deleted a run's logs, the run cannot be analysed.",
        scope: "Results come from three repositories and do not generalize to every kind of pipeline.",
      },
    },
  },
  security: {
    title: "Security",
    lead: "The controls in place, and the limits accepted for this prototype.",
    sections: {
      signIn: {
        title: "Sign-in and sessions",
        items: {
          github: "You sign in with GitHub (OAuth with PKCE and a single-use state). Pipesor has no passwords of its own.",
          session: "A Pipesor session lasts at most one hour and lives only in the browser tab; it is not renewed in the browser.",
          tokens: "Your GitHub token never reaches the browser: it is kept by the services in Azure Key Vault.",
        },
      },
      access: {
        title: "Two layers of authorization",
        items: {
          explicit: "Every pipeline grants explicit capabilities — View, Operate, Configure — to named people.",
          github: "Each request also checks your current access to the repository on GitHub; losing it there removes it here.",
          nothing: "Signing in grants no data, and no GitHub role grants Pipesor access automatically.",
        },
      },
      github: {
        title: "Read-only GitHub access",
        items: {
          permissions: "The Pipesor GitHub App asks only for read access to Actions and metadata.",
          noChanges: "Pipesor never changes code, workflows, secrets, permissions or settings in your repositories.",
        },
      },
      data: {
        title: "Data protection",
        items: {
          minimal: "Only a protected excerpt of at most 40 lines is processed; the full log stays on GitHub.",
          masking: "Emails, IP addresses, GitHub tokens, JWTs and secret values are masked; excerpts with private keys are refused.",
          logs: "Technical logs record identifiers and outcomes, never log content or tokens.",
        },
      },
      infrastructure: {
        title: "Infrastructure",
        items: {
          https: "All traffic uses HTTPS.",
          database: "The database is private to the virtual network and uses Azure identities instead of passwords.",
          secrets: "Secrets live in Azure Key Vault with role-based access.",
          services: "Each service has its own identity with least privilege, and services call each other with short-lived tokens.",
        },
      },
      browser: {
        title: "In your browser",
        items: {
          headers: "A strict content security policy, no framing and no referrer leakage.",
          storage: "No cookies, no analytics. Only your session (this tab) and display preferences are stored.",
        },
      },
      audit: {
        title: "Audit trail",
        items: {
          audit: "Registrations, access changes, configuration and incident steps are recorded with who did them.",
          reviews: "Diagnosis reviews are append-only.",
        },
      },
      limits: {
        title: "Accepted limits of this prototype",
        items: {
          mfa: "No multi-factor authentication of its own: your GitHub account's security applies.",
          revocation: "Sessions cannot be revoked centrally before they expire (one hour at most).",
          gateway: "No web application firewall or per-user rate limiting.",
          environment: "It runs in an academic development environment on Azure.",
        },
      },
    },
  },
} as const;

export default about;
