import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { parseEvidenceLocator, type DiagnosisEvidence } from "../../../entities/diagnosis";
import { Button } from "../../../shared/ui/button";

import styles from "./IncidentWorkspace.module.css";

const PREVIEW_LINES = 3;

/**
 * One observed-evidence signal: `Stage · job file · lines a–b` from the v2
 * locator, a short preview, and the full sanitized excerpt under "View context".
 */
export function EvidenceItem({ evidence, cited }: { evidence: DiagnosisEvidence; cited: boolean }) {
  const { t } = useTranslation("operations");
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const location = parseEvidenceLocator(evidence.sourceLocator);
  const lines = evidence.content.replace(/\s+$/, "").split("\n");
  const preview = lines.slice(0, PREVIEW_LINES).join("\n");
  const expandable = lines.length > PREVIEW_LINES;

  const parts = [evidence.stage?.trim() || t("workspace.evidence.unknownStage")];
  if (location) {
    parts.push(location.file);
    parts.push(
      location.fromLine === location.toLine
        ? t("workspace.evidence.line", { from: location.fromLine })
        : t("workspace.evidence.lines", { from: location.fromLine, to: location.toLine }),
    );
  }

  return (
    <li className={styles.evidenceItem}>
      <div className={styles.evidenceHead}>
        <span className={styles.evidenceMeta}>
          <span>{parts.join(" · ")}</span>
          {cited && <span className={styles.tag}>{t("workspace.evidence.cited")}</span>}
        </span>
        {expandable && (
          <Button
            variant="link"
            className={styles.contextToggle}
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? t("workspace.evidence.hideContext") : t("workspace.evidence.viewContext")}
          </Button>
        )}
      </div>
      <pre id={contentId} className={styles.excerpt}>{expanded || !expandable ? evidence.content : preview}</pre>
    </li>
  );
}
