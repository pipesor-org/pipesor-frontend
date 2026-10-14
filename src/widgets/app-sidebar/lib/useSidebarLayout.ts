import { useCallback, useEffect, useState } from "react";

import { readStoredValue, writeStoredValue } from "../../../shared/lib";

const SIDEBAR_STORAGE_KEY = "pipesor.sidebar";
const COLLAPSED_VALUE = "collapsed";

export interface SidebarLayout {
  /** Desktop: whether the rail is collapsed to icons only. */
  collapsed: boolean;
  /** Flips the collapsed rail and persists the explicit choice. */
  toggleCollapsed: () => void;
  /** Narrow viewports: whether the overlay sidebar is open. */
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
}

/**
 * Sidebar presentation state.
 *
 * Owns the desktop collapse preference (persisted locally) and the transient
 * narrow-viewport overlay toggle. This is layout state only — deliberately kept
 * out of the domain/feature layers.
 */
export function useSidebarLayout(): SidebarLayout {
  const [collapsed, setCollapsed] = useState(
    () => readStoredValue(SIDEBAR_STORAGE_KEY) === COLLAPSED_VALUE,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    writeStoredValue(
      SIDEBAR_STORAGE_KEY,
      collapsed ? COLLAPSED_VALUE : "expanded",
    );
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((previous) => !previous);
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return { collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile };
}
