/**
 * Evidence locator v2, emitted by Log/Event:
 * `v2:job:<jobId>:member:<pct-encoded file>:lines:<from>-<to>:sha256:<digest>`.
 * Parsed for display only; the raw value stays the provenance reference.
 */
export interface EvidenceLocation {
  jobId: string;
  file: string;
  fromLine: number;
  toLine: number;
}

const LOCATOR = /^v2:job:([1-9][0-9]*):member:([^:]+):lines:([1-9][0-9]*)-([1-9][0-9]*):sha256:[0-9a-f]{64}$/;

export function parseEvidenceLocator(value: string | null | undefined): EvidenceLocation | null {
  const match = value ? LOCATOR.exec(value) : null;
  if (!match) return null;
  let file: string;
  try {
    file = decodeURIComponent(match[2]);
  } catch {
    return null;
  }
  const fromLine = Number(match[3]);
  const toLine = Number(match[4]);
  if (toLine < fromLine) return null;
  return { jobId: match[1], file, fromLine, toLine };
}
