import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";

import { LanguageSelector } from "../../../shared/i18n";
import { ThemeToggle } from "../../../shared/ui/theme-toggle";

import styles from "./UserMenu.module.css";

/**
 * Signed-in demo user. Static content for the prototype — this is not an
 * account feature and exposes no real identity.
 */
const USER = {
  initials: "MP",
  name: "Maya Patel",
  role: "DevOps / SRE",
} as const;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface UserMenuProps {
  /** Whether the sidebar rail is collapsed (avatar only). */
  collapsed: boolean;
}

/**
 * User profile control at the bottom of the sidebar.
 *
 * Opens a popover that hosts the language selector — the only interactive
 * content — so no account, settings or sign-out actions are invented. Keyboard
 * behaviour: focus moves into the popover on open and cycles inside it, Escape
 * dismisses and returns focus to the trigger, and a pointer-down outside closes
 * it.
 *
 * The popover is anchored relative to `.root` in CSS (above the control when
 * expanded, to its right when collapsed). It is intentionally *not* portaled:
 * an earlier portal + measured `top`/`left` anchored the popover at the
 * trigger's top, so it overlapped the avatar and intercepted the click that was
 * meant to close it (and spilled past the viewport). Anchoring in CSS keeps the
 * popover out of the trigger's hit area and inside the viewport.
 */
export function UserMenu({ collapsed }: UserMenuProps) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const focusable = popoverRef.current?.querySelector<HTMLElement>(
      FOCUSABLE_SELECTOR,
    );
    focusable?.focus();
  }, [open]);

  const handlePopoverKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;

    const focusable =
      popoverRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger}${collapsed ? ` ${styles.triggerCollapsed}` : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        title={collapsed ? USER.name : undefined}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className={styles.avatar}>{USER.initials}</span>
        {/*
         * The identity block stays in layout (never `display:none`/visually
         * hidden) and simply shrinks to zero width when the rail is collapsed.
         * Keeping its height reserved means the trigger height — and therefore
         * the avatar position and the popover anchor — is identical in both
         * states, so expanding/collapsing never makes the profile jump.
         */}
        <span className={styles.meta}>
          <span className={styles.name}>{USER.name}</span>
          <span className={styles.role}>{USER.role}</span>
        </span>
      </button>

      {open ? (
        <div
          id={popoverId}
          ref={popoverRef}
          className={`${styles.popover}${collapsed ? ` ${styles.popoverCollapsed}` : ""}`}
          role="dialog"
          aria-label={t("userMenu.label")}
          onKeyDown={handlePopoverKeyDown}
        >
          <div className={styles.identity}>
            <span className={styles.identityName}>{USER.name}</span>
            <span className={styles.identityRole}>{USER.role}</span>
          </div>
          <div className={styles.themeToggleWrapper}>
            <span className={styles.themeLabel}>{t("theme.label")}</span>
            <ThemeToggle />
          </div>
          <LanguageSelector />
        </div>
      ) : null}
    </div>
  );
}
