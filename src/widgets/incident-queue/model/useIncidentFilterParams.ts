import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { readIncidentFilters, writeIncidentFilters, type IncidentFilterScope, type IncidentFilters } from "../../../entities/incident";

/**
 * Queue criteria kept in the URL (REPLACE), so Back from the Workspace and a
 * shared link restore them. `scope` (the criteria the view offers) must be a
 * stable object, such as one of `FILTER_SCOPES`.
 */
export function useIncidentFilterParams(scope: IncidentFilterScope) {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readIncidentFilters(params, scope), [params, scope]);
  const setFilters = useCallback(
    (next: IncidentFilters) => setParams((previous) => writeIncidentFilters(previous, next), { replace: true }),
    [setParams],
  );
  return [filters, setFilters] as const;
}
