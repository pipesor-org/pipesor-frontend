import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "../../../shared/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "../../../shared/ui/icons";

import { JOURNEY_STEPS, STEP_DURATION_MS, nextStep, previousStep, stepProgress, type JourneyStep } from "../model/journey";
import { JourneyIcon } from "./journeyIcons";
import styles from "./DataJourney.module.css";

/** Tokens the specimen highlights: what is about to be masked, what was masked, and event templates. */
const MARKS = /(\[redacted\]|<\*>|ghp_[A-Za-z0-9]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;

function markClass(token: string): string {
  if (token === "[redacted]") return styles.redacted;
  if (token === "<*>") return styles.template;
  return styles.sensitive;
}

/** One specimen line with its marked tokens. */
function SpecimenLine({ line }: { line: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of line.matchAll(MARKS)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(line.slice(last, index));
    parts.push(<mark key={index} className={markClass(match[0])}>{match[0]}</mark>);
    last = index + match[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return <span className={styles.line}>{parts}</span>;
}

interface DataJourneyProps {
  step: JourneyStep;
  onStepChange: (step: JourneyStep) => void;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  /** Focus target for "See in the journey" links. */
  trackRef?: React.Ref<HTMLOListElement>;
}

/**
 * How data travels from a failed run to a validated diagnosis: a track of
 * eight stages with a packet moving along it, and, for the current stage,
 * what happens, where, what is kept and an illustrative specimen of the data
 * at that point. It plays by itself unless the person prefers reduced motion;
 * any control pauses it. The detail is an ordered, readable text equivalent.
 */
export function DataJourney({ step, onStepChange, playing, onPlayingChange, trackRef }: DataJourneyProps) {
  const { t } = useTranslation("about");
  const titleId = useId();
  const latest = useRef({ step, onStepChange });
  latest.current = { step, onStepChange };

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => latest.current.onStepChange(nextStep(latest.current.step)), STEP_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [playing, step]);

  const go = (target: JourneyStep) => {
    onPlayingChange(false);
    onStepChange(target);
  };
  const index = JOURNEY_STEPS.indexOf(step);
  const copy = (key: "short" | "title" | "text" | "where" | "kept" | "sample", target: JourneyStep = step) => t(`journey.steps.${target}.${key}`);

  return (
    <section className={styles.journey} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 id={titleId}>{t("journey.title")}</h2>
        <p>{t("journey.lead")}</p>
      </div>

      <div className={styles.stage} style={{ "--progress": stepProgress(step) } as CSSProperties}>
        <span className={styles.rail} aria-hidden="true"><span className={styles.fill} /></span>
        <span className={styles.packet} data-playing={playing} aria-hidden="true" />
        <ol className={styles.track} ref={trackRef} tabIndex={-1} aria-label={t("journey.title")}>
          {JOURNEY_STEPS.map((target, position) => (
            <li key={target}>
              <button
                type="button"
                className={styles.node}
                data-state={position < index ? "done" : position === index ? "current" : "next"}
                aria-current={position === index ? "step" : undefined}
                onClick={() => go(target)}
              >
                <span className={styles.icon}><JourneyIcon step={target} /></span>
                <span className={styles.short}>{copy("short", target)}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.detail} key={step}>
        <div className={styles.copy} aria-live="polite">
          <p className={styles.number}>{String(index + 1).padStart(2, "0")}</p>
          <h3>{copy("title")}</h3>
          <p>{copy("text")}</p>
          <dl className={styles.facts}>
            <div><dt>{t("journey.where")}</dt><dd>{copy("where")}</dd></div>
            <div><dt>{t("journey.kept")}</dt><dd>{copy("kept")}</dd></div>
          </dl>
        </div>
        <figure className={styles.specimen}>
          <figcaption>{t("journey.example")}</figcaption>
          <pre>{copy("sample").split("\n").map((line, position) => <SpecimenLine key={position} line={line} />)}</pre>
        </figure>
      </div>

      <div className={styles.controls} role="group" aria-label={t("journey.controls.label")}>
        <Button size="sm" variant="ghost" onClick={() => go(previousStep(step))}>
          <ChevronLeftIcon /><span className={styles.srOnly}>{t("journey.controls.previous")}</span>
        </Button>
        <Button size="sm" onClick={() => onPlayingChange(!playing)} aria-pressed={playing}>
          {playing ? t("journey.controls.pause") : t("journey.controls.play")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => go(nextStep(step))}>
          <ChevronRightIcon /><span className={styles.srOnly}>{t("journey.controls.next")}</span>
        </Button>
        <span className={styles.position}>{t("journey.controls.position", { current: index + 1, total: JOURNEY_STEPS.length })}</span>
        <span className={styles.timer} aria-hidden="true">
          <span key={`${step}-${playing}`} className={styles.timerFill} data-playing={playing} style={{ animationDuration: `${STEP_DURATION_MS}ms` }} />
        </span>
      </div>
    </section>
  );
}
