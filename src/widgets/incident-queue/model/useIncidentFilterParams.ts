import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
  readIncidentFilters,
  writeIncidentFilters,
  type DiagnosisCriterion,
  type IncidentFilters,
  type IncidentStatus,
} from "../../../entities/incident";

const NO_DIAGNOSES: readonly DiagnosisCriterion[] = [];

/**
 * Queue criteria kept in the URL (REPLACE), so Back from the Workspace and a
 * shared link restore them. The allowed values (the view's Status and
 * Validation facets) must be stable arrays.
 */
export function useIncidentFilterParams(
  allowedStatuses: readonly IncidentStatus[],
  allowedDiagnoses: readonly DiagnosisCriterion[] = NO_DIAGNOSES,
) {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(
    () => readIncidentFilters(params, allowedStatuses, allowedDiagnoses),
    [params, allowedStatuses, allowedDiagnoses],
  );
  const setFilters = useCallback(
    (next: IncidentFilters) => setParams((previous) => writeIncidentFilters(previous, next), { replace: true }),
    [setParams],
  );
  return [filters, setFilters] as const;
}
