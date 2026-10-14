import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { pipesorSymbolLight } from "../../../shared/assets";
import { appDestinations } from "../../../shared/config";
import { useMediaQuery } from "../../../shared/lib";
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
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const sidebarId = useId();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasMobileOpen = useRef(false);

  // The icon-only rail is a desktop affordance; on narrow viewports the sidebar
  // is always shown expanded inside the overlay.
  const isCollapsed = collapsed && !isMobile;

  // Move focus into the overlay when it opens and back to the trigger when it
  // closes, so the sidebar is usable by keyboard alone.
  useEffect(() => {
    if (isMobile && mobileOpen) {
      toggleRef.current?.focus();
    } else if (wasMobileOpen.current) {
      triggerRef.current?.focus();
    }
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
                  src={pipesorSymbolLight}
                  alt=""
                  width={24}
                  height={24}
                />
                {!isMobile && isCollapsed ? (
                  <button
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
