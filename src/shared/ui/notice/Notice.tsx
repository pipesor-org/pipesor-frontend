import type { HTMLAttributes } from "react";

import type { StatusTone } from "../status-badge";

import styles from "./Notice.module.css";

export type NoticeTone = Exclude<StatusTone, "accent">;

interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
  /** `critical` for failures, `warning` for blocked or limited actions, `success` for completed steps, `info`/`neutral` for context. */
  tone?: NoticeTone;
}

/**
 * A short message about the current view: a failure, a completed step, or a
 * limitation. Pass `role="alert"` or `role="status"` when it appears after an
 * action so assistive technology announces it; static context needs no role.
 */
export function Notice({ tone = "neutral", className, ...props }: NoticeProps) {
  return <div className={`${styles.notice} ${styles[tone]}${className ? ` ${className}` : ""}`} {...props} />;
}
