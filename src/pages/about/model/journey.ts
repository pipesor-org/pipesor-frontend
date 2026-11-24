/** Steps of the data journey, in order (copy: `about:journey.steps.<id>`). */
export const JOURNEY_STEPS = ["run", "protect", "publish", "process", "retrieve", "diagnose", "incident", "validate"] as const;
export type JourneyStep = (typeof JOURNEY_STEPS)[number];

/** Time each step stays on screen while the journey plays. */
export const STEP_DURATION_MS = 4800;

export function nextStep(step: JourneyStep): JourneyStep {
  return JOURNEY_STEPS[(JOURNEY_STEPS.indexOf(step) + 1) % JOURNEY_STEPS.length];
}

export function previousStep(step: JourneyStep): JourneyStep {
  return JOURNEY_STEPS[(JOURNEY_STEPS.indexOf(step) - 1 + JOURNEY_STEPS.length) % JOURNEY_STEPS.length];
}

/** Position of a step along the track, from 0 (first) to 1 (last). */
export function stepProgress(step: JourneyStep): number {
  return JOURNEY_STEPS.indexOf(step) / (JOURNEY_STEPS.length - 1);
}

/** Whether the journey should start playing: not when the person prefers reduced motion. */
export function autoplayAllowed(): boolean {
  return !(typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true);
}
