import type { JourneyStep } from "../model/journey";

/** 20 px stroke glyphs for the journey stages, drawn in `currentColor`. */
const PATHS: Record<JourneyStep, string> = {
  // A failed run: a cross (the node already draws the circle).
  run: "m5.5 5.5 9 9m0-9-9 9",
  // Protection: a shield with a check.
  protect: "M10 2.5 4 4.8v4.6c0 3.9 2.6 6.8 6 8.1 3.4-1.3 6-4.2 6-8.1V4.8L10 2.5Zm-2.6 7.7 1.9 1.9 3.4-3.6",
  // Publication: a message travelling along a bus.
  publish: "M3 10h9m0 0-3-3m3 3-3 3M14 5.5h3v9h-3",
  // Structure and correlation: stacked layers.
  process: "M10 3 3 6.5 10 10l7-3.5L10 3Zm-7 7L10 13.5 17 10M3 13.5 10 17l7-3.5",
  // Retrieval: a book and a magnifier.
  retrieve: "M4 4.5h5.5a2 2 0 0 1 2 2V16a1.5 1.5 0 0 0-1.5-1.5H4v-10Zm11.5 9.5 2 2m-1-4.25a2.75 2.75 0 1 1-5.5 0 2.75 2.75 0 0 1 5.5 0Z",
  // Diagnosis: a light bulb.
  diagnose: "M7.5 14.5h5M8 17h4m-2-14a5 5 0 0 0-3 9c.6.5 1 1.2 1 2h4c0-.8.4-1.5 1-2a5 5 0 0 0-3-9Z",
  // Incident: a flag.
  incident: "M5 17.5V3m0 0h9l-1.8 3.5L14 10H5",
  // Validation: a person with a check.
  validate: "M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 8c0-2.8 2.2-5 5-5 1.2 0 2.3.4 3.2 1.1M12.5 15l1.8 1.8 3.2-3.6",
};

export function JourneyIcon({ step }: { step: JourneyStep }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d={PATHS[step]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
