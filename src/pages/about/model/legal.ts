/**
 * Privacy policy and Terms of use: structure and order. The words live in the
 * `about` namespace under `privacy.*` and `terms.*`, keyed by the section ids
 * agreed with the thesis writer (`privacy.controller`, `terms.nature`…), so
 * both languages share one structure.
 */

import { githubAuthorizedAppsUrl } from "../../../shared/config";

/** Date of the current version of both documents: the version people accept at sign-in. */
export { LEGAL_DOCUMENTS_VERSION as LEGAL_UPDATED_AT } from "../../../shared/config";

/** Controller of the personal data: the thesis authors, surnames first. Names and addresses are not translated. */
export const CONTROLLER = [
  { name: "Gálvez Chambi, Jhon Alexander", email: "u202323270@upc.edu.pe" },
  { name: "Guzmán Chávez, Ramiro Alexander", email: "u202217062@upc.edu.pe" },
] as const;

/** Microsoft's statement on how Azure OpenAI handles prompts, answers and abuse monitoring. */
export const AZURE_OPENAI_PRIVACY_URL = "https://learn.microsoft.com/azure/foundry/responsible-ai/openai/data-privacy";


/**
 * A piece of a section. Keys are relative to the section (`privacy.sections.<id>.<key>`):
 * - `text`: a paragraph; `note`: a statement that must stand out;
 * - `list`: items under `<key>.<item>`;
 * - `table`: headers under `<key>.columns.<column>`, cells under `<key>.rows.<row>.<column>`;
 * - `contact`: the controller's names and addresses;
 * - `link`: an external link (`href`) or another About view (`view`) labelled by `<key>`.
 */
export type LegalBlock =
  | { kind: "text" | "note"; key: string }
  | { kind: "list"; key: string; items: readonly string[] }
  | { kind: "table"; key: string; columns: readonly string[]; rows: readonly string[] }
  | { kind: "contact" }
  | { kind: "link"; key: string; href: string }
  | { kind: "link"; key: string; view: "ai" | "privacy" | "terms" };

export interface LegalSection {
  id: string;
  blocks: readonly LegalBlock[];
}

export type LegalDocumentId = "privacy" | "terms";

const PRIVACY: readonly LegalSection[] = [
  { id: "controller", blocks: [{ kind: "text", key: "text" }, { kind: "contact" }, { kind: "text", key: "contact" }] },
  {
    id: "data",
    blocks: [
      {
        kind: "table",
        key: "table",
        columns: ["data", "purpose", "audience"],
        rows: ["githubId", "githubLogin", "internalId", "githubToken", "consent", "reviews", "pipelineData", "logExcerpts", "accessLogs", "report"],
      },
      { kind: "text", key: "source" },
      { kind: "note", key: "noEmail" },
      { kind: "text", key: "collaborators" },
      { kind: "note", key: "names" },
    ],
  },
  {
    id: "purposes",
    blocks: [
      { kind: "text", key: "lead" },
      { kind: "list", key: "items", items: ["session", "access", "diagnose", "validate", "audit", "security"] },
      { kind: "text", key: "noTraining" },
    ],
  },
  { id: "basis", blocks: [{ kind: "text", key: "consent" }, { kind: "text", key: "withdraw" }] },
  {
    id: "browser",
    blocks: [
      { kind: "note", key: "noCookies" },
      { kind: "list", key: "items", items: ["session", "preferences", "fonts", "avatars"] },
    ],
  },
  {
    id: "processors",
    blocks: [
      { kind: "text", key: "lead" },
      { kind: "list", key: "items", items: ["azure", "github"] },
      { kind: "note", key: "transfer" },
      { kind: "text", key: "openai" },
      { kind: "text", key: "abuse" },
      { kind: "link", key: "microsoft", href: AZURE_OPENAI_PRIVACY_URL },
    ],
  },
  {
    id: "retention",
    blocks: [
      {
        kind: "table",
        key: "table",
        columns: ["data", "period"],
        rows: ["diagnoses", "operational", "identity", "token", "consent", "messages", "serviceLogs", "accessLogs", "backups", "originalLogs", "report"],
      },
    ],
  },
  {
    id: "rights",
    blocks: [
      { kind: "text", key: "text" },
      { kind: "note", key: "manual" },
      { kind: "text", key: "signOut" },
      { kind: "link", key: "revoke", href: githubAuthorizedAppsUrl },
      { kind: "text", key: "authority" },
    ],
  },
  {
    id: "ai",
    blocks: [
      { kind: "text", key: "model" },
      { kind: "text", key: "receives" },
      { kind: "text", key: "never" },
      { kind: "text", key: "noTraining" },
      { kind: "text", key: "human" },
      { kind: "link", key: "more", view: "ai" },
    ],
  },
  { id: "changes", blocks: [{ kind: "text", key: "text" }, { kind: "text", key: "consent" }] },
];

const TERMS: readonly LegalSection[] = [
  { id: "nature", blocks: [{ kind: "text", key: "what" }, { kind: "text", key: "academic" }] },
  {
    id: "access",
    blocks: [
      { kind: "text", key: "signIn" },
      { kind: "text", key: "lead" },
      { kind: "list", key: "conditions", items: ["grant", "github"] },
      { kind: "text", key: "noRole" },
      { kind: "text", key: "session" },
      { kind: "note", key: "age" },
    ],
  },
  {
    id: "github",
    blocks: [
      { kind: "text", key: "lead" },
      { kind: "list", key: "items", items: ["readOnly", "noChanges", "token", "excerpt", "expired", "report"] },
      { kind: "text", key: "signOut" },
    ],
  },
  {
    id: "ai",
    blocks: [{ kind: "note", key: "suggestion" }, { kind: "text", key: "limits" }, { kind: "text", key: "human" }],
  },
  {
    id: "responsibilities",
    blocks: [
      { kind: "text", key: "lead" },
      { kind: "list", key: "items", items: ["authorized", "review", "people", "access", "reviewText", "logs", "account", "abuse"] },
    ],
  },
  { id: "availability", blocks: [{ kind: "note", key: "noGuarantee" }, { kind: "text", key: "records" }] },
  { id: "ownership", blocks: [{ kind: "text", key: "owners" }, { kind: "text", key: "processing" }, { kind: "link", key: "privacy", view: "privacy" }] },
  { id: "liability", blocks: [{ kind: "text", key: "asIs" }, { kind: "text", key: "limit" }, { kind: "text", key: "rights" }] },
  { id: "law", blocks: [{ kind: "text", key: "governing" }, { kind: "text", key: "consumer" }, { kind: "text", key: "language" }] },
  { id: "contact", blocks: [{ kind: "text", key: "text" }, { kind: "contact" }, { kind: "text", key: "changes" }] },
];

export const LEGAL_DOCUMENTS: Record<LegalDocumentId, readonly LegalSection[]> = { privacy: PRIVACY, terms: TERMS };
