import { useTranslation } from "react-i18next";

import {
  selectDiagnosisTimeSeries,
  type InsightsDiagnosisBucket,
} from "../../../entities/incident";
import { useFormatters } from "../../../shared/i18n";

import styles from "./HistoryInsightsDiagnosisTrend.module.css";

/**
 * Geometry taken from the approved frame: a 214px plotting box whose top and
 * baseline sit 10px inside the box, so gridlines never touch the surface edges.
 */
const PLOT_HEIGHT = 214;
const PLOT_TOP = 20;
const PLOT_BASELINE = 204;

/**
 * Candidate y-axis steps. The frame shows four whole-minute intervals
 * (`0`–`4m`); picking the smallest step that keeps four intervals adapts that
 * rhythm to the fixture means without inventing a fixed domain.
 */
const AXIS_STEPS_MS = [
  60_000, 120_000, 300_000, 600_000, 900_000, 1_800_000, 3_600_000,
] as const;

interface PlotPoint {
  index: number;
  x: number;
  y: number;
  valueMs: number;
}

function axisStep(maxMs: number): number {
  const target = Math.max(maxMs, 1) / 4;
  const nice = AXIS_STEPS_MS.find((step) => step >= target);
  // Anything above an hour falls back to whole hours, still four intervals.
  return nice ?? Math.ceil(target / 3_600_000) * 3_600_000;
}

/** Horizontal percentage for a bucket's point: first at 0, last at 100. */
function xPercent(index: number, count: number): number {
  return count <= 1 ? 50 : (index / (count - 1)) * 100;
}

/**
 * Diagnosis-time trend.
 *
 * A single-series line chart drawn with inline SVG (no chart dependency). Points
 * are weekly means from the incident entity. A bucket without a measurement is
 * never bridged: the line breaks, the value lane says "No data", and the point is
 * omitted, so three empty weeks cannot read as a flat or interpolated line.
 *
 * The visual plot is hidden from assistive technology; the same values are
 * exposed as a plain list of periods below it, which keeps the chart's geometry
 * out of the accessibility tree.
 */
export function HistoryInsightsDiagnosisTrend() {
  const { t } = useTranslation("history");
  const {
    formatDuration,
    formatPreciseDuration,
    formatShortDate,
    formatShortDateRange,
  } = useFormatters();
  const series = selectDiagnosisTimeSeries();

  const maxMs = series.buckets.reduce(
    (max, bucket) =>
      bucket.meanDiagnosisMs === null
        ? max
        : Math.max(max, bucket.meanDiagnosisMs),
    0,
  );
  const stepMs = axisStep(maxMs);
  const topMs = stepMs * 4;
  const ticks = [0, 1, 2, 3, 4].map((index) => index * stepMs);

  const yFor = (valueMs: number) =>
    PLOT_BASELINE - (valueMs / topMs) * (PLOT_BASELINE - PLOT_TOP);

  const points: (PlotPoint | null)[] = series.buckets.map((bucket, index) =>
    bucket.meanDiagnosisMs === null
      ? null
      : {
          index,
          x: xPercent(index, series.buckets.length),
          y: yFor(bucket.meanDiagnosisMs),
          valueMs: bucket.meanDiagnosisMs,
        },
  );

  // Consecutive populated buckets form a run; a gap closes it so the line only
  // connects adjacent periods that actually have a measurement.
  const runs: PlotPoint[][] = [];
  let run: PlotPoint[] = [];
  for (const point of points) {
    if (point) {
      run.push(point);
    } else if (run.length > 0) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length > 0) runs.push(run);

  const range = formatShortDateRange(series.window.start, series.window.end);
  const bucketValue = (bucket: InsightsDiagnosisBucket) =>
    bucket.meanDiagnosisMs === null
      ? t("insights.summary.noData")
      : formatPreciseDuration(bucket.meanDiagnosisMs);

  return (
    <section className={styles.surface}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t("insights.trend.title")}</h2>
        <p className={styles.caption}>
          {t("insights.trend.caption", { range })}
        </p>
      </header>

      <div className={styles.body}>
        <div className={styles.area} aria-hidden="true">
          <div className={styles.plot}>
            {ticks.map((tick) => (
              <span
                key={`grid-${tick}`}
                className={styles.gridLine}
                style={{ top: yFor(tick) }}
              />
            ))}

            {ticks.map((tick) => (
              <span
                key={`tick-${tick}`}
                className={styles.axisLabel}
                style={{ top: yFor(tick) - 9 }}
              >
                {tick === 0 ? "0" : formatDuration(tick)}
              </span>
            ))}

            <svg
              className={styles.lineLayer}
              viewBox={`0 0 100 ${PLOT_HEIGHT}`}
              preserveAspectRatio="none"
            >
              {runs
                .filter((segment) => segment.length > 1)
                .map((segment) => (
                  <polyline
                    key={segment[0].index}
                    points={segment
                      .map((point) => `${point.x},${point.y}`)
                      .join(" ")}
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
            </svg>

            {points.map((point) =>
              point === null ? null : (
                <span
                  key={`dot-${point.index}`}
                  className={styles.dot}
                  style={{ left: `${point.x}%`, top: point.y }}
                />
              ),
            )}

            {series.buckets.map((bucket, index) => {
              const point = points[index];

              return point === null ? (
                <span
                  key={`value-${bucket.start}`}
                  className={styles.noDataLabel}
                  style={{ left: `${xPercent(index, series.buckets.length)}%` }}
                >
                  {t("insights.summary.noData")}
                </span>
              ) : (
                <span
                  key={`value-${bucket.start}`}
                  className={styles.valueLabel}
                  style={{
                    left: `${point.x}%`,
                    top: Math.max(0, point.y - 28),
                  }}
                >
                  {formatPreciseDuration(point.valueMs)}
                </span>
              );
            })}

            {series.buckets.map((bucket, index) => (
              <span
                key={`axis-${bucket.start}`}
                className={styles.axisTick}
                style={{ left: `${xPercent(index, series.buckets.length)}%` }}
              >
                {formatShortDate(bucket.start)}
              </span>
            ))}
          </div>
        </div>

        <ul className={styles.srOnly}>
          {series.buckets.map((bucket) => (
            <li key={bucket.start}>
              {t("insights.trend.bucket", {
                date: formatShortDate(bucket.start),
                value: bucketValue(bucket),
              })}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
