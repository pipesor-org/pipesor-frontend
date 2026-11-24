import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { readIncidentFilters, writeIncidentFilters, type IncidentFilters, type IncidentStatus } from "../../../entities/incident";

/**
 * Queue criteria kept in the URL (REPLACE), so Back from the Workspace and a
 * shared link restore them. `allowedStatuses` must be a stable array.
 */
export function useIncidentFilterParams(allowedStatuses: readonly IncidentStatus[]) {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readIncidentFilters(params, allowedStatuses), [params, allowedStatuses]);
  const setFilters = useCallback(
    (next: IncidentFilters) => setParams((previous) => writeIncidentFilters(previous, next), { replace: true }),
    [setParams],
  );
  return [filters, setFilters] as const;
}
