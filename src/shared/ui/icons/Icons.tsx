import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Operations — four-panel grid. */
export function OperationsIcon(props: IconProps) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect
        x={3}
        y={3}
        width={6}
        height={6}
        rx={1}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <rect
        x={13}
        y={3}
        width={6}
        height={6}
        rx={1}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <rect
        x={3}
        y={13}
        width={6}
        height={6}
        rx={1}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <rect
        x={13}
        y={13}
        width={6}
        height={6}
        rx={1}
        stroke="currentColor"
        strokeWidth={1.5}
      />
    </svg>
  );
}

/** History — clock with a return arrow. */
export function HistoryIcon(props: IconProps) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M3 10a8 8 0 1 1 2 7M3 4v6h6"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path d="M11 6v6l4 2" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

/** Pipelines — branching workflow nodes. */
export function PipelinesIcon(props: IconProps) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect
        x={2}
        y={8}
        width={5}
        height={6}
        rx={1}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <rect
        x={15}
        y={2}
        width={5}
        height={6}
        rx={1}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <rect
        x={15}
        y={14}
        width={5}
        height={6}
        rx={1}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path d="M7 11h4V5h4M11 11v6h4" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

/** Search — magnifier. */
export function SearchIcon(props: IconProps) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle
        cx={8.5}
        cy={8.5}
        r={5.5}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path d="m13 13 4 4" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

/** Chevron pointing down — used by select controls. */
export function ChevronDownIcon(props: IconProps) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth={1.4} />
    </svg>
  );
}

/** Chevron pointing right. */
export function ChevronRightIcon(props: IconProps) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="m4.5 3 3 3-3 3" stroke="currentColor" strokeWidth={1.4} />
    </svg>
  );
}

/** Chevron pointing left — collapses the sidebar rail. */
export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="m7.5 3-3 3 3 3" stroke="currentColor" strokeWidth={1.4} />
    </svg>
  );
}

/** Menu — opens the overlay sidebar on narrow viewports. */
export function MenuIcon(props: IconProps) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

/** Plus — add/create actions. */
export function PlusIcon(props: IconProps) {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

/** Up/down chevrons: a control that opens a menu (the profile trigger). */
export function ChevronsUpDownIcon(props: IconProps) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="m4.5 5.5 2.5-2.5 2.5 2.5M4.5 8.5 7 11l2.5-2.5" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Check mark: a completed step. */
export function CheckIcon(props: IconProps) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="m2.5 6.25 2.25 2.25 4.75-5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** "About" / information: a circle with an "i". */
export function InfoIcon(props: IconProps) {
  return (
    <svg width={18} height={18} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-8.5V15m0-7.5v.01" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Settings: a gear. */
export function SettingsIcon(props: IconProps) {
  return (
    <svg width={18} height={18} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M11 13.75a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z" stroke="currentColor" strokeWidth={1.5} />
      <path d="M17.7 13.1a1.4 1.4 0 0 0 .28 1.55l.05.05a1.7 1.7 0 1 1-2.4 2.4l-.05-.05a1.4 1.4 0 0 0-1.55-.28 1.4 1.4 0 0 0-.85 1.28v.15a1.7 1.7 0 1 1-3.4 0v-.08a1.4 1.4 0 0 0-.92-1.28 1.4 1.4 0 0 0-1.55.28l-.05.05a1.7 1.7 0 1 1-2.4-2.4l.05-.05a1.4 1.4 0 0 0 .28-1.55 1.4 1.4 0 0 0-1.28-.85h-.15a1.7 1.7 0 0 1 0-3.4h.08a1.4 1.4 0 0 0 1.28-.92 1.4 1.4 0 0 0-.28-1.55l-.05-.05a1.7 1.7 0 1 1 2.4-2.4l.05.05a1.4 1.4 0 0 0 1.55.28h.07a1.4 1.4 0 0 0 .85-1.28v-.15a1.7 1.7 0 1 1 3.4 0v.08a1.4 1.4 0 0 0 .85 1.28 1.4 1.4 0 0 0 1.55-.28l.05-.05a1.7 1.7 0 1 1 2.4 2.4l-.05.05a1.4 1.4 0 0 0-.28 1.55v.07a1.4 1.4 0 0 0 1.28.85h.15a1.7 1.7 0 0 1 0 3.4h-.08a1.4 1.4 0 0 0-1.28.85Z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
