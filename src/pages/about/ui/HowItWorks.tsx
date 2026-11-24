import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { autoplayAllowed, type JourneyStep } from "../model/journey";
import { DataJourney } from "./DataJourney";
import { Glossary } from "./Glossary";
import styles from "./About.module.css";

const INCIDENT_TRACK = ["open", "remediation", "verification", "resolved"] as const;
const VALIDATION_TRACK = ["pending", "outcome"] as const;

/** The two independent tracks an incident follows. */
function Tracks() {
  const { t } = useTranslation("about");
  return (
    <section className={styles.tracks} aria-labelledby="about-tracks">
      <div className={styles.sectionHead}>
        <h2 id="about-tracks">{t("tracks.title")}</h2>
        <p>{t("tracks.lead")}</p>
      </div>
      <div className={styles.trackGrid}>
        <div className={styles.trackCard}>
          <h3>{t("tracks.incident.title")}</h3>
          <ol className={styles.chain}>
            {INCIDENT_TRACK.map((step) => <li key={step}><span>{t(`tracks.incident.steps.${step}`)}</span></li>)}
          </ol>
          <p>{t("tracks.incident.note")}</p>
        </div>
        <div className={styles.trackCard}>
          <h3>{t("tracks.validation.title")}</h3>
          <ol className={styles.chain}>
            {VALIDATION_TRACK.map((step) => <li key={step}><span>{t(`tracks.validation.steps.${step}`)}</span></li>)}
          </ol>
          <p>{t("tracks.validation.note")}</p>
        </div>
      </div>
    </section>
  );
}

/** How it works: the data journey, the two tracks and the glossary, linked together. */
export function HowItWorks() {
  const [step, setStep] = useState<JourneyStep>("run");
  const [playing, setPlaying] = useState(autoplayAllowed);
  const track = useRef<HTMLOListElement>(null);

  // A glossary jump stops the journey on the requested step and brings it into view.
  const showStep = (target: JourneyStep) => {
    setPlaying(false);
    setStep(target);
    track.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    track.current?.focus({ preventScroll: true });
  };

  return (
    <div className={styles.view}>
      <DataJourney step={step} onStepChange={setStep} playing={playing} onPlayingChange={setPlaying} trackRef={track} />
      <Tracks />
      <Glossary onShowStep={showStep} />
    </div>
  );
}
