// Run with: bun src/pages/pipelines/model/inventory.check.ts
import { monitoredPipelines } from "../../../entities/monitored-pipeline";
import { pipelineDetailPath, routes } from "../../../shared/config";
import { isPendingSearchEcho, pipelineInventoryReturnPath, readInventoryQuery, selectInventoryPipelines } from "./inventory";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const select = (search: string) => selectInventoryPipelines(readInventoryQuery(new URLSearchParams(search)));
const snapshot = JSON.stringify(monitoredPipelines);
const pendingValues = new Set(["", "A", "AB"]);
assert(isPendingSearchEcho("REPLACE", "A", pendingValues), "Older own URL commit must not overwrite newer input");
assert(!isPendingSearchEcho("PUSH", "", pendingValues), "Sidebar PUSH must clear a pending draft for the blank URL");
assert(!isPendingSearchEcho("POP", "A", pendingValues), "History POP must hydrate its URL even if it matches a pending value");
assert(!isPendingSearchEcho("REPLACE", "external", pendingValues), "External query must hydrate the input");
assert(select("").every((pipeline, index) => pipeline === monitoredPipelines[index]), "Fixture order changed");
for (const [search, slug] of [
  ["q=DEPLOY-PRODUCTION", "deploy-production"],
  ["q=CODE+QUALITY", "quality-check"],
  ["q=ACME%2FCHECKOUT", "integration-tests"],
]) {
  const results = select(search);
  assert(results.length === 1 && results[0].slug === slug, "Case-insensitive search failed");
}
assert(select("monitoring=Paused").length === 2, "Paused records missing");
assert(select("criticality=High").length === 3, "Criticality filter failed");
assert(select("team=Platform+Engineering").length === 3, "Team filter failed");
const combined = "q=provision&criticality=Critical&team=Platform+Engineering&monitoring=Paused";
assert(select(combined).length === 1, "Conjunctive filters lost a matching record");
assert(select(combined.replace("Paused", "Active")).length === 0, "Filters were not conjunctive");
assert(select("q=no-such-workflow").length === 0, "No-results search failed");
assert(select("criticality=Invalid&team=Unknown&monitoring=Running").length === 7, "Invalid URL filters must be ignored");
assert(selectInventoryPipelines(readInventoryQuery(new URLSearchParams()), []).length === 0, "Empty collection fell back to fixtures");
assert(JSON.stringify(monitoredPipelines) === snapshot, "Inventory filtering mutated fixtures");

const back = pipelineInventoryReturnPath({ pipelineSearch: combined });
assert(back === `${routes.pipelines}?${combined}`, "List criteria were not preserved");
assert(select(back.split("?")[1]).length === 1, "Restored URL did not restore filters");
for (const state of [null, undefined, {}, "https://example.com", { pipelineSearch: 3 }, { returnTo: "//example.com" }]) {
  assert(pipelineInventoryReturnPath(state) === routes.pipelines, "Unsafe/malformed state must use inventory fallback");
}
assert(pipelineInventoryReturnPath({ pipelineSearch: "https://example.com" }) === routes.pipelines, "External location escaped inventory");
assert(pipelineInventoryReturnPath({ pipelineSearch: "q=hello&redirect=https://example.com&criticality=Invalid" }) === "/pipelines?q=hello", "Unknown query fields were retained");
assert(pipelineDetailPath(monitoredPipelines[0].id) === `/pipelines/${monitoredPipelines[0].id}`, "Stable detail identity lost");
assert(pipelineDetailPath("../new?x=y") === "/pipelines/..%2Fnew%3Fx%3Dy", "Detail path did not encode identity");
console.log("Pipeline inventory query and return-context checks passed");
