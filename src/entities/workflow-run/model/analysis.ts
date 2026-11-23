/**
 * Pure rules of a run attempt's analysis/capture receipt: which phases are
 * final, why a receipt was blocked, and how a receipt is followed until it is
 * final. Kept free of I/O so it can be tested without the network.
 */
export const ANALYSIS_PHASES = ["ACCEPTED", "PREPARING", "PUBLISHED", "BLOCKED"] as const;
export type AnalysisPhase = (typeof ANALYSIS_PHASES)[number];

export interface AnalysisReceipt {
  phase: AnalysisPhase;
  blockedReason?: string | null;
}

/** `PUBLISHED` and every `BLOCKED` are final: the receipt never changes again. */
export function isTerminalPhase(phase: AnalysisPhase): boolean {
  return phase === "PUBLISHED" || phase === "BLOCKED";
}

/**
 * Why a receipt is blocked, in the terms the UI explains:
 * - `sourceExpired`: GitHub no longer keeps the run's logs (retention).
 * - `scopeChanged`: access to the repository or the monitoring scope changed.
 * - `other`: any reason this client does not know yet.
 * `null` when the receipt is not blocked.
 */
export type AnalysisBlock = "sourceExpired" | "scopeChanged" | "other";

export function analysisBlock(receipt: AnalysisReceipt): AnalysisBlock | null {
  if (receipt.phase !== "BLOCKED") return null;
  switch (receipt.blockedReason) {
    case "SOURCE_EXPIRED":
      return "sourceExpired";
    case "SCOPE_CHANGED":
      return "scopeChanged";
    default:
      return "other";
  }
}

export class AnalysisTimeoutError extends Error {
  constructor() {
    super("Analysis did not finish in time");
    this.name = "AnalysisTimeoutError";
  }
}

export interface FollowOptions {
  onPhase?: (phase: AnalysisPhase) => void;
  intervalMs: number;
  timeoutMs: number;
  wait: (ms: number) => Promise<void>;
  now: () => number;
}

/**
 * Follows a receipt until its phase is final, reporting each phase. Stops as
 * soon as the phase is `PUBLISHED` or `BLOCKED` (no further reads); a missing
 * receipt keeps the last one. Throws `AnalysisTimeoutError` after `timeoutMs`.
 */
export async function followAnalysis<T extends AnalysisReceipt>(
  initial: T,
  fetchNext: () => Promise<T | null>,
  { onPhase, intervalMs, timeoutMs, wait, now }: FollowOptions,
): Promise<T> {
  let receipt = initial;
  const deadline = now() + timeoutMs;
  while (!isTerminalPhase(receipt.phase)) {
    onPhase?.(receipt.phase);
    if (now() > deadline) throw new AnalysisTimeoutError();
    await wait(intervalMs);
    receipt = (await fetchNext()) ?? receipt;
  }
  onPhase?.(receipt.phase);
  return receipt;
}
