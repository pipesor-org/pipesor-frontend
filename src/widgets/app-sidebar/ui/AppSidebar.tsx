import { useEffect, useId, useLayoutEffect, useRef, type FocusEvent } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { pipesorSymbolDark, pipesorSymbolLight } from "../../../shared/assets";
import { appDestinations } from "../../../shared/config";
import { useMediaQuery, useTheme } from "../../../shared/lib";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HistoryIcon,
  MenuIcon,
  OperationsIcon,
  PipelinesIcon,
} from "../../../shared/ui/icons";

import { useSidebarLayout } from "../lib/useSidebarLayout";

import { UserMenu } from "./UserMenu";

import styles from "./AppSidebar.module.css";

const ICON_BY_DESTINATION = {
  operations: OperationsIcon,
  history: HistoryIcon,
  pipelines: PipelinesIcon,
};

/** Below this width the sidebar leaves the flow and becomes an overlay. */
const MOBILE_MEDIA_QUERY = "(max-width: 900px)";

/**
 * Global navigation rail.
 *
 * Desktop: expands to a labelled rail or collapses to an icon rail (the choice
 * is persisted by `useSidebarLayout`). Narrow viewports: the same rail is
 * presented as a temporary overlay so it never permanently occupies a fixed
 * width; it is opened from a floating trigger and dismissed with the backdrop,
 * the toggle, or Escape.
 */
export function AppSidebar() {
  const { t } = useTranslation("common");
  const { collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile } =
    useSidebarLayout();
  const { theme } = useTheme();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const sidebarId = useId();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const expandRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const focusedControlRef = useRef<HTMLElement | null>(null);
  const wasMobile = useRef(isMobile);
  const wasMobileOpen = useRef(false);

  // Inert or removed controls can lose focus to body without a new focus target.
  const rememberFocus = (event: FocusEvent<HTMLElement>) => {
    focusedControlRef.current = event.target;
  };
  const forgetFocus = (event: FocusEvent<HTMLElement>) => {
    if (event.relatedTarget) focusedControlRef.current = null;
  };

  // The icon-only rail is a desktop affordance; on narrow viewports the sidebar
  // is always shown expanded inside the overlay.
  const isCollapsed = collapsed && !isMobile;

  // Restore focus only to controls available in the current viewport.
  useLayoutEffect(() => {
    const activeElement = document.activeElement;
    const lostControlFocus =
      activeElement === document.body && focusedControlRef.current !== null;

    if (isMobile && mobileOpen) {
      toggleRef.current?.focus();
    } else if (
      isMobile &&
      (wasMobileOpen.current ||
        sidebarRef.current?.contains(activeElement) ||
        lostControlFocus)
    ) {
      triggerRef.current?.focus();
    } else if (
      !isMobile &&
      wasMobile.current &&
      (activeElement === triggerRef.current || lostControlFocus)
    ) {
      (toggleRef.current ?? expandRef.current)?.focus();
    }
    wasMobile.current = isMobile;
    wasMobileOpen.current = isMobile && mobileOpen;
  }, [isMobile, mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobile();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeMobile]);

  return (
    <>
      <button
        ref={triggerRef}
        onFocusCapture={rememberFocus}
        onBlurCapture={forgetFocus}
        type="button"
        className={styles.mobileTrigger}
        aria-label={t("sidebar.open")}
        aria-expanded={mobileOpen}
        aria-controls={sidebarId}
        onClick={openMobile}
      >
        <MenuIcon />
      </button>

      {mobileOpen ? (
        <div
          className={styles.backdrop}
          onClick={closeMobile}
          aria-hidden="true"
        />
      ) : null}

      <aside
        ref={sidebarRef}
        inert={isMobile && !mobileOpen}
        onFocusCapture={rememberFocus}
        onBlurCapture={forgetFocus}
        id={sidebarId}
        className={`${styles.sidebar}${isCollapsed ? ` ${styles.sidebarCollapsed}` : ""}${mobileOpen ? ` ${styles.sidebarMobileOpen}` : ""}`}
      >
        <header className={styles.header}>
          <div className={styles.brandWrapper}>
            <div className={styles.brand}>
              {/* Decorative: the product name is the adjacent text. */}
              <div
                className={styles.brandIconContainer}
                onKeyDown={(e) => {
                  if (isMobile || !isCollapsed) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleCollapsed();
                  }
                }}
                tabIndex={isMobile || !isCollapsed ? -1 : 0}
                role={isMobile || !isCollapsed ? undefined : "button"}
                aria-label={isMobile || !isCollapsed ? undefined : t("sidebar.expand")}
              >
                <img
                  className={styles.brandIcon}
                  src={theme === "dark" ? pipesorSymbolDark : pipesorSymbolLight}
                  alt=""
                  width={24}
                  height={24}
                />
                {!isMobile && isCollapsed ? (
                  <button
                    ref={expandRef}
                    type="button"
                    className={styles.brandExpandButton}
                    aria-label={t("sidebar.expand")}
                    aria-controls={sidebarId}
                    onClick={toggleCollapsed}
                  >
                    <ChevronRightIcon />
                  </button>
                ) : null}
              </div>
              <span
                className={`${styles.brandName}${isCollapsed ? ` ${styles.srOnly}` : ""}`}
              >
                Pipesor
              </span>
            </div>

            {!isMobile && !isCollapsed ? (
              <button
                ref={toggleRef}
                type="button"
                className={styles.toggle}
                aria-label={t("sidebar.collapse")}
                aria-expanded={!isCollapsed}
                aria-controls={sidebarId}
                onClick={toggleCollapsed}
              >
                <ChevronLeftIcon />
              </button>
            ) : null}

            {isMobile ? (
              <button
                ref={toggleRef}
                type="button"
                className={styles.toggle}
                aria-label={t("sidebar.close")}
                aria-expanded={mobileOpen}
                aria-controls={sidebarId}
                onClick={closeMobile}
              >
                <ChevronRightIcon />
              </button>
            ) : null}
          </div>
        </header>

        <nav className={styles.nav} aria-label={t("nav.primary")}>
          {appDestinations.map(({ key, labelKey, path, implemented }) => {
            const Icon = ICON_BY_DESTINATION[key];
            const label = t(labelKey);

            if (!implemented) {
              // Not a control: the destination has no screen yet, so it is plain
              // text rather than a (misleading) disabled link. A visually hidden
              // note communicates the unavailability to assistive technology.
              return (
                <span
                  key={key}
                  className={`${styles.navItem} ${styles.navItemDisabled}`}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className={styles.navIcon} />
                  <span
                    className={`${styles.navLabel}${isCollapsed ? ` ${styles.srOnly}` : ""}`}
                  >
                    {label}
                  </span>
                  <span className={styles.srOnly}>
                    {t("destinationUnavailable")}
                  </span>
                </span>
              );
            }

            return (
              <NavLink
                key={key}
                to={path}
                title={isCollapsed ? label : undefined}
                className={({ isActive }) =>
                  `${styles.navItem}${isActive ? ` ${styles.navItemActive}` : ""}`
                }
              >
                <Icon className={styles.navIcon} />
                <span
                  className={`${styles.navLabel}${isCollapsed ? ` ${styles.srOnly}` : ""}`}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.spacer} />

        <UserMenu collapsed={isCollapsed} />
      </aside>
    </>
  );
}
