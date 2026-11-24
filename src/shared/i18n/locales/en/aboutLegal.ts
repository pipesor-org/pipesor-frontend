/**
 * `about` namespace — English: Privacy policy, Terms of use and the standards
 * alignment of AI transparency. Section ids (`privacy.controller`,
 * `terms.nature`…) are shared with the thesis texts. Every statement describes
 * the implemented system (fact sheet: docs/content/ficha-tecnica-paginas-informativas.md).
 */

export const legal = {
  updated: "Last updated: {{date}}",
  contents: "On this page",
  team: "Pipesor Team",
  external: "opens in a new tab",
};

export const privacy = {
  title: "Privacy and personal data policy",
  intro: {
    prototype: "Pipesor is the prototype of a thesis at Universidad Peruana de Ciencias Aplicadas (UPC), deployed in a development environment. It is not a commercial service.",
    scope: "This policy explains what personal data we process, why, where and for how long, under Peru's Personal Data Protection Law (Law No. 29733) and its Regulation, approved by Supreme Decree No. 016-2024-JUS.",
  },
  sections: {
    controller: {
      title: "Controller and contact",
      text: "The controller of your personal data is the Pipesor Team, formed by the thesis authors:",
      contact: "For any question about this policy or your data, write to either of them.",
    },
    data: {
      title: "What data we process",
      table: {
        columns: { data: "Data", purpose: "Purpose", audience: "Who can see it" },
        rows: {
          githubId: {
            data: "Your numeric GitHub user ID",
            purpose: "Identify you when you sign in",
            audience: "You and the Pipesor Team",
          },
          githubLogin: {
            data: "Your GitHub username (login)",
            purpose: "Show who is signed in and record sign-in attempts",
            audience: "You and the Pipesor Team",
          },
          internalId: {
            data: "An internal identifier derived from your GitHub ID",
            purpose: "Manage permissions, the audit trail and the authorship of your reviews",
            audience: "Whoever configures the pipeline. Anyone who can view the pipeline sees who wrote each review",
          },
          githubToken: {
            data: "Your GitHub access token",
            purpose: "Read GitHub on your behalf, with read-only permissions",
            audience: "Pipesor's services only. It never reaches your browser",
          },
          reviews: {
            data: "The text of your reviews (comment and actual cause, up to 1,500 characters)",
            purpose: "Validate the diagnosis",
            audience: "Anyone who can view the pipeline",
          },
          pipelineData: {
            data: "Pipeline data: repository, workflow, branch, commit and runs",
            purpose: "Operate the service",
            audience: "Anyone who can view the pipeline",
          },
          logExcerpts: {
            data: "Sanitized log excerpts of up to 40 lines",
            purpose: "Serve as evidence for the diagnosis",
            audience: "Anyone who can view the pipeline",
          },
          accessLogs: {
            data: "Dashboard access logs: your IP address, the date and time, the page requested and your browser",
            purpose: "Protect the service and investigate errors",
            audience: "The Pipesor Team",
          },
          report: {
            data: "Diagnosis report, only if the repository adds Pipesor's report workflow: the diagnosis, the sanitized evidence and the sources, without reviews",
            purpose: "Keep the diagnosis next to the failed run on GitHub",
            audience: "Anyone who can see the repository's Actions artifacts on GitHub",
          },
        },
      },
      source: "This data comes from GitHub — from your account when you sign in, and from the repositories and runs the Pipesor GitHub App can read — or from what you write in Pipesor.",
      noEmail: "We do not store your email address. Email addresses that appear inside logs are masked.",
      collaborators: "The avatar, username and role of repository collaborators are not stored: they are fetched from GitHub when whoever configures a pipeline chooses who gets access.",
      names: "Please note: log excerpts may contain names of people or users, such as a commit author or a file path. Sanitization does not detect names.",
    },
    purposes: {
      title: "How we use it",
      lead: "We use your data to:",
      items: {
        session: "identify you and keep your session;",
        access: "check, on every request, your permission in Pipesor and your current access to the repository on GitHub;",
        diagnose: "capture failed runs of registered workflows and generate a probable diagnosis;",
        validate: "record the human validation of each diagnosis and the lifecycle of each incident;",
        audit: "keep an audit trail of registrations, permissions, configuration and status changes;",
        security: "keep the dashboard's access logs to protect the service and investigate errors.",
      },
      noTraining: "Pipesor includes no analytics or telemetry. We do not train AI models with your data.",
    },
    basis: {
      title: "Legal basis and consent",
      consent: "We process your data with your consent. You give it on the sign-in screen, by checking the box that accepts this policy and the Terms of use before continuing with GitHub. It also covers the international transfer described under “Processors and international transfers”.",
      withdraw: "You can withdraw it at any time by signing out and writing to the Pipesor Team. Withdrawing does not affect processing carried out before.",
    },
    browser: {
      title: "Data in your browser",
      noCookies: "Pipesor does not use cookies, analytics or telemetry tools.",
      items: {
        session: "sessionStorage, cleared when you close the tab: your Pipesor session (an access token that expires within one hour at most, plus your GitHub ID and username) and the page to return to after installing the GitHub App.",
        preferences: "localStorage: only your interface preferences (theme, language and sidebar).",
        fonts: "Fonts: served by Pipesor itself. Your browser contacts no font provider.",
        avatars: "Profile pictures: loaded from GitHub's servers (avatars.githubusercontent.com), so GitHub receives your IP address when one is shown.",
      },
    },
    processors: {
      title: "Processors and international transfers",
      lead: "Pipesor relies on these providers:",
      items: {
        azure: "Microsoft Azure (Microsoft Corporation): hosting, database, messaging, the secrets vault (Azure Key Vault) and the AI models (Azure OpenAI). West US 3 region, United States.",
        github: "GitHub (GitHub, Inc., a Microsoft subsidiary): sign-in, original logs, profile pictures, the GitHub App and, if the repository uses it, the diagnosis report. United States.",
      },
      transfer: "International transfer. Because Pipesor and these providers operate in the United States, using it involves a cross-border transfer of your personal data from Peru to that country.",
      openai: "The AI model is operated by Microsoft within Azure. According to Microsoft, prompts and answers are not available to OpenAI or to other model providers.",
      abuse: "Azure OpenAI applies Microsoft's default abuse monitoring, which we have not modified: if its automated systems flag content, Microsoft may keep it within the United States data zone and authorized Microsoft staff may review it. Microsoft does not publish a fixed retention period for this data.",
      microsoft: "Microsoft: data, privacy and security for Azure OpenAI",
    },
    retention: {
      title: "Retention",
      table: {
        columns: { data: "Data", period: "Period" },
        rows: {
          diagnoses: {
            data: "Sanitized log excerpts, diagnoses, evidence and reviews",
            period: "A 365-day policy is documented but not yet enforced: today no service deletes this data.",
          },
          operational: {
            data: "Operational data: pipelines, permissions, incidents and audit records",
            period: "Kept with no deletion period.",
          },
          identity: {
            data: "Your GitHub connection and its history, and sign-in attempts (with your username)",
            period: "No defined period. They are kept after you sign out.",
          },
          token: {
            data: "Your GitHub token, in Azure Key Vault",
            period: "No defined period. Signing out does not delete it; if it were deleted, Key Vault would keep it 30 more days before purging it.",
          },
          messages: { data: "Internal messages between services", period: "14 days." },
          serviceLogs: {
            data: "Technical logs of the services (identifiers and outcomes, not content)",
            period: "30 days.",
          },
          accessLogs: { data: "Dashboard access logs (IP address, date, page and browser)", period: "30 days." },
          backups: { data: "Database backups", period: "7 days." },
          originalLogs: {
            data: "Original logs",
            period: "Not stored in Pipesor. GitHub keeps them for 90 days by default, under its own policy.",
          },
          report: {
            data: "Diagnosis report on GitHub (optional)",
            period: "Kept by GitHub for the period the repository sets (90 days by default).",
          },
        },
      },
    },
    rights: {
      title: "Your rights and how to exercise them",
      text: "Law No. 29733 grants you the rights of information, access, rectification, erasure and objection over your personal data.",
      manual: "Pipesor does not yet have an automated process for these rights: there is no option to delete your account or export your data. Write to the Pipesor Team (see “Controller and contact”) and we will handle your request manually.",
      signOut: "Signing out also disconnects your GitHub account from Pipesor: your access stops until you sign in again. Today it does not revoke your authorization on GitHub or delete the stored token. You can revoke the authorization yourself on GitHub, under Settings → Applications → Authorized GitHub Apps.",
      revoke: "Authorized GitHub Apps on GitHub",
      authority: "If you believe your request was not handled, you may file a claim with Peru's National Authority for Personal Data Protection (Autoridad Nacional de Protección de Datos Personales).",
    },
    ai: {
      title: "Data and artificial intelligence",
      model: "Diagnoses are generated by GPT-6 Luna (version 2026-09-22), accessed through the Azure OpenAI API in the West US 3 region with the Data Zone Standard option: processing stays within the United States data zone.",
      receives: "What the model receives: only sanitized log excerpts, with the stage where they occurred, and passages from authorized technical documentation.",
      never: "What it does not receive: full logs, repository or workflow names, your identity, tokens or data about reviewers.",
      noTraining: "No training: we do not train or fine-tune models, and your reviews are not fed back into the model or the knowledge base. The knowledge base changes only when the team imports authorized documentation with an administrative tool.",
      human: "Human review: every diagnosis is a probable cause until a person validates it. No recommendation is ever executed automatically.",
      more: "More details in AI transparency",
    },
    changes: {
      title: "Changes to this policy",
      text: "We will update this policy when the system changes, for example when the retention policy starts being enforced. The date of the latest update appears at the top.",
      consent: "If a change affects the purposes of the processing or the transfers, we will ask for your consent again.",
    },
  },
};

export const terms = {
  title: "Terms of use",
  intro: {
    acceptance: "By using Pipesor you accept these terms. If you do not agree with them, do not use Pipesor.",
  },
  sections: {
    nature: {
      title: "What Pipesor is",
      what: "Pipesor is the academic prototype of a thesis at Universidad Peruana de Ciencias Aplicadas (UPC). It is an AIOps platform: it monitors GitHub Actions workflows, captures failed runs and generates a probable diagnosis with a language model, which a person then validates.",
      academic: "Pipesor is not a commercial service. It runs in a development environment on an academic Azure subscription.",
    },
    access: {
      title: "Accounts and access",
      signIn: "You sign in with your GitHub account. Anyone with a GitHub account can sign in, but signing in grants access to no data.",
      lead: "You will only see a pipeline if two conditions are met, and both are checked on every request:",
      conditions: {
        grant: "you have an explicit permission in Pipesor (view, operate or configure); and",
        github: "you can read its repository on GitHub.",
      },
      noRole: "No GitHub role grants permissions in Pipesor automatically. Whoever configures a pipeline decides who gets access. If you lose access to the repository on GitHub, you also lose it in Pipesor.",
      session: "Your session lasts one hour at most; after that you must sign in again. Pipesor has no multi-factor authentication of its own: the security of your access depends on your GitHub account.",
      age: "You must be 18 or older to use Pipesor.",
    },
    github: {
      title: "GitHub access",
      lead: "A repository administrator installs the Pipesor GitHub App and registers the workflows to monitor.",
      items: {
        readOnly: "The App has minimal read-only permissions (Actions and Metadata).",
        noChanges: "Pipesor does not change code, workflows, secrets or permissions.",
        token: "Your GitHub token is used only for reading, is stored in Azure Key Vault and never reaches your browser.",
        excerpt: "For each failed run, Pipesor takes an excerpt of up to 40 lines from the first failed step and sanitizes it. The full log is not stored in Pipesor; the original stays on GitHub.",
        expired: "If GitHub has already deleted a run's logs, Pipesor cannot analyze it.",
        report: "If the repository adds Pipesor's report workflow, the workflow fetches the diagnosis with GitHub Actions' own identity token and stores it as an artifact of the failed run, where anyone who can see the repository's artifacts can read it.",
      },
      signOut: "Signing out disconnects your GitHub account from Pipesor. To also revoke the authorization you gave the App, use your GitHub settings (Settings → Applications → Authorized GitHub Apps).",
    },
    ai: {
      title: "AI-generated diagnoses",
      suggestion: "Each diagnosis is an AI-generated suggestion. It includes a probable cause, a recommended manual check, its limitations, and the evidence and sources it relies on.",
      limits: "A diagnosis may be wrong or incomplete. The model only sees a 40-line excerpt, sanitization may remove useful data, and the model is not deterministic. Pipesor shows no confidence percentage: uncertainty is described in the limitations. Without access to the knowledge base, no diagnosis is generated.",
      human: "Every diagnosis requires human validation. Pipesor does not execute fixes: recording a remediation only documents work done by a person. Validating a diagnosis and resolving an incident are separate processes; resolving requires a successful verification run.",
    },
    responsibilities: {
      title: "User responsibilities",
      lead: "By using Pipesor you agree to:",
      items: {
        authorized: "register only workflows from repositories you administer or are authorized to use;",
        review: "review each diagnosis before acting on it: operational decisions are yours;",
        people: "not use diagnoses or incident data to evaluate the performance of people;",
        access: "grant access only to people who need it;",
        reviewText: "not write personal or confidential data in review text, which anyone with access to the pipeline can see alongside your identifier;",
        logs: "keep secrets and personal data out of your logs: sanitization reduces the risk but does not remove it;",
        account: "keep your GitHub account secure;",
        abuse: "not attempt to bypass access controls or use Pipesor in ways that affect other users.",
      },
    },
    availability: {
      title: "Availability and continuity",
      noGuarantee: "Pipesor is provided with no guarantee of availability or continuity. The environment may be interrupted or recreated at any time, including without prior notice.",
      records: "Do not use Pipesor as your only record of important information. Original logs remain on GitHub, subject to its retention policy.",
    },
    ownership: {
      title: "Ownership of data and repositories",
      owners: "Repositories and their content belong to their owners. Using Pipesor transfers no rights over them.",
      processing: "Pipesor only processes sanitized log excerpts, for the sole purpose of diagnosing failures. The processing of personal data is described in the Privacy policy.",
      privacy: "Read the Privacy policy",
    },
    liability: {
      title: "Limitation of liability",
      asIs: "Pipesor is an academic prototype and is provided as is, with no warranties regarding the accuracy of diagnoses, availability or fitness for a particular purpose.",
      limit: "To the extent permitted by applicable law, the Pipesor Team is not liable for damages arising from decisions based on diagnoses, service interruptions, or loss of data stored in Pipesor.",
      rights: "Nothing in these terms limits rights that the law grants you and that cannot be limited by contract.",
    },
    law: {
      title: "Applicable law and jurisdiction",
      governing: "These terms are governed by the laws of the Republic of Peru. Any dispute arising from them or from the use of Pipesor will first be addressed in good faith by writing to the Pipesor Team. If it is not resolved within 30 days, the parties submit to the courts of Cercado de Lima, Peru.",
      consumer: "This does not limit any right that mandatory law grants you, including filing a complaint with the National Authority for Personal Data Protection, INDECOPI or another competent authority, or going to the courts of your domicile.",
      language: "These terms are published in Spanish and English. In case of discrepancy, the Spanish version prevails.",
    },
    contact: {
      title: "Contact and changes",
      text: "For any question about these terms, write to the Pipesor Team:",
      changes: "We may update these terms when the system changes. The date of the latest update appears at the top of this page. If you keep using Pipesor after a change, you accept the new version.",
    },
  },
};

export const standards = {
  title: "Alignment with standards",
  intro: "Pipesor is not certified against any artificial intelligence standard, and its technical documentation was not written from them. This table shows, practice by practice, which principles of recognized frameworks the design decisions on this page pursue. Aligning with a principle does not mean complying with that standard: it means the practice pursues the same goal. The known gaps are listed after the table.",
  risk: "Under the Regulation of Law No. 31814, the team classifies Pipesor as an acceptable-risk system (art. 22.2): it is neither a prohibited use (art. 23) nor a high-risk use (art. 24), and it never acts on its own. This is the team's reading, not a legal opinion.",
  editions: "Editions: Regulation of Law No. 31814, approved by Supreme Decree No. 115-2025-PCM; ISO/IEC 42001:2023; ISO/IEC 23894:2023; NIST AI RMF 1.0 (NIST AI 100-1); OWASP Top 10 for LLM Applications 2025.",
  caption: "Pipesor practices and the principles they align with",
  columns: { practice: "Pipesor practice", principle: "Principle or requirement", framework: "Framework", reference: "Reference" },
  frameworks: {
    peru31814: "Regulation of Law No. 31814 (Peru)",
    iso42001: "ISO/IEC 42001",
    iso23894: "ISO/IEC 23894",
    nist: "NIST AI RMF",
    owasp: "OWASP Top 10 for LLM 2025",
  },
  references: {
    control: "Annex A, control {{id}}",
    annex: "Annex A, {{id}}",
    clause: "Clause {{id}}",
  },
  articles: {
    oversight: "Art. 7(h) “Supervisión humana”",
    transparency: "Art. 7(i) “Transparencia”; Art. 25 “Transparencia algorítmica”",
    accountability: "Art. 7(j) “Rendición de cuentas”",
    security: "Art. 7(e)",
    privacy: "Art. 7(b); Art. 26",
  },
  practices: {
    humanValidation: {
      text: "Every output is a probable cause until a person validates it (confirms, corrects or rejects it)",
      principles: {
        oversight: "Human oversight",
        responsibleUse: "Processes for the responsible use of AI systems",
        oversightProcesses: "Human oversight processes defined and documented",
      },
    },
    noAutomation: {
      text: "No recommendation is executed automatically; the GitHub App is read-only",
      principles: {
        excessiveAgency: "Avoid excessive agency (minimal functions, permissions and autonomy)",
        intendedUse: "Use in line with the system's intended use",
      },
    },
    explained: {
      text: "Each diagnosis shows its probable cause, manual check, limitations, evidence and cited sources",
      principles: {
        transparency: "Transparency",
        documentation: "System documentation and information for users",
        explainability: "Transparency and explainability",
        interpreted: "Output explained and interpreted in its context",
      },
    },
    versions: {
      text: "The model and prompt versions are recorded with each diagnosis",
      principles: {
        eventLogs: "Event logging of the AI system",
        accountability: "Transparency and accountability",
        peruAccountability: "Accountability",
      },
    },
    noConfidence: {
      text: "No confidence percentage is computed; uncertainty is stated in the limitations",
      principles: {
        knowledgeLimits: "Document the system's knowledge limits",
        misinformation: "Mitigate misinformation and overreliance on the output",
      },
    },
    evidenceOnly: {
      text: "The model must use only the evidence given and treat it as data, not as instructions",
      principles: {
        injection: "Mitigate prompt injection",
        security: "Security, proportionality and reliability",
      },
    },
    strictOutput: {
      text: "The answer's format is strictly validated; only the sources actually used are cited",
      principles: {
        outputHandling: "Proper output handling",
        verification: "Verification and validation of the AI system",
      },
    },
    sanitized: {
      text: "Logs are sanitized before any AI processing; the model receives no full logs, repository names, identities or tokens",
      principles: {
        privacy: "Privacy of personal data",
        preparation: "Data preparation",
        privacyRisk: "Privacy",
        privacyExamined: "Privacy risk examined and documented",
        disclosure: "Prevent sensitive information disclosure",
      },
    },
    noTraining: {
      text: "No model is trained or fine-tuned; reviews do not feed the model or the retrieval corpus",
      principles: {
        poisoning: "Prevent data and model poisoning",
        dataManagement: "Data management for developing and improving the system",
      },
    },
    corpus: {
      text: "The retrieval corpus holds only authorized technical documentation (22 documents, 33 passages), kept apart from evaluation material",
      principles: {
        provenance: "Data provenance",
        testData: "Availability and quality of test data",
        vectors: "Protect the vector store and retrieved content",
      },
    },
    evaluation: {
      text: "Published evaluation: 17 of 20 (85 %), 95 % Wilson interval 64 %–95 %, with its reviewers and limitations disclosed",
      principles: {
        validity: "Demonstrate validity and reliability, and document the limits of generalization",
        verification: "Verification and validation of the AI system",
        reporting: "Recording and reporting of the risk process",
      },
    },
    limitations: {
      text: "Known limitations are published: 40-line excerpt, sanitization, dependence on retrieval, non-determinism, deleted logs and the scope of the validation repositories",
      principles: {
        identification: "Risk identification",
        knowledgeLimits: "Document the system's knowledge limits",
      },
    },
    suppliers: {
      text: "Third-party models used through an API (Azure OpenAI, West US 3), with the model, its version and the region identified",
      principles: {
        supplierManagement: "Supplier management",
        thirdParty: "Monitoring of third-party resource risks",
        supplyChain: "Supply chain risks",
      },
    },
  },
  gaps: {
    title: "Known gaps",
    items: {
      rateLimit: "There is no per-user request limit, so the system is not yet aligned with OWASP LLM10:2025 Unbounded Consumption.",
      retention: "The 365-day retention policy is documented but not enforced.",
      reviewers: "The evaluation used one reviewer per case, and the reviewers were the system's authors.",
    },
  },
};
