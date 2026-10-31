# Pipelines — Functional Decision Register

**The connected workflow is approved; its remaining state, identity and editing semantics are not.** Recommendations below require explicit approval and do not authorize implementation.

References: **E** = [End-to-End Exploration](docs/temp/pipelines-e2e-exploration.md); **M** = [Functional Architecture Map](docs/architecture/frontend-functional-map.md); **C** = [Frontend Conventions](docs/frontend-conventions.md).

## 1. Confirmed functional boundaries

**Confirmed**

- Inventory supports search, filtering and navigation to Detail or Add.
- Detail separates read-only GitHub metadata from independently editable Pipesor policy and ownership.
- Add registers an existing workflow and opens its new Detail; Cancel discards changes and returns to inventory.
- Active/Paused controls **AIOps monitoring**, never GitHub execution. Monitoring covers authorized runs across branches; default branch is informational.
- Criticality is not incident severity; ownership neither assigns incidents nor grants GitHub permissions.

The current approved intent supersedes the exploration’s older uncertainty about whether these interactions belong in scope.  
**Evidence:** current approved intent; E §§B.1, C.3, G.3; [AGENTS.md](AGENTS.md), “Localization and domain data.”

## 2. Pipeline identity and navigation

**Recommended — Pending Approval**

**Confirmed / gap:** A monitored pipeline references a workflow, but slug, display name and workflow filename are different identifiers. No stable identity or detail/Add route is approved; M’s routes are illustrative.

**Recommendation:** Use an immutable Pipesor record identity, independent of display labels, with `/pipelines/:pipelineId`; reserve `/pipelines/new` for Add. Unknown identities show Not Found with an inventory return path. Do not join incidents through display strings.

Repository/path can identify duplicates without becoming the route identity. Workflow rename/move continuity remains undefined—not guaranteed by this recommendation.  
**Evidence:** E §§B.3, C.1, C.4; M §6; C §6.

## 3. Operational Environment

**Recommended — Pending Approval**

**Contradiction:** Detail places Environment within “read-only GitHub context”; Add explicitly defines **Operational environment** as AIOps-only policy, with no required marker.

**Recommendation:** Treat it as one optional, Pipesor-managed classification, editable under Operational Policy and displayed consistently across all three views. Allow unset; do not infer it from branches or repositories. It neither modifies GitHub Environments nor limits monitoring coverage.

Do not extrapolate an enterprise taxonomy from the displayed Production, QA and Development examples.  
**Evidence:** E §§A.3–A.4, C.1, G.1.1; M §3.

## 4. Independent policy and ownership saves

**Recommended — Pending Approval**

**Confirmed / gap:** Independent editing is approved; commitment, cancellation and feedback are unspecified.

**Recommendation:** Explicit **Save/Cancel per section**. Each save changes only that section; the other section’s draft remains untouched. Inventory reflects committed values, never drafts. Invalid or failed saves retain the draft and leave committed values unchanged. Leaving Detail with unsaved edits requests discard confirmation.

Autosave preserves the mockup’s lighter appearance, but makes commitment and recovery less explicit. Multi-user conflict handling remains undefined.  
**Evidence:** E §§B.3, E.2.

## 5. Shared demonstration state and lifetime

**Recommended — Pending Approval**

**Confirmed / gap:** No backend or persistence contract exists. Separate screen fixtures cannot support coherent registration and editing.

**Recommendation:** Inventory, Detail, duplicate detection and Add use one shared demonstration collection. Changes survive navigation but reset on page reload; disclose that limitation plainly. A temporary record’s old URL may consequently become Not Found.

Do not imply durable configuration, cross-tab synchronization or cross-user visibility.  
**Evidence:** E §B.3; C §10; [README.md](README.md), current scope/backend limitations.

## 6. Inventory query semantics

**Recommended — Pending Approval**

**Confirmed / gap:** Search and the three visible filters are approved, but matching and combination rules are absent.

**Recommendation:** Case-insensitive search across pipeline label, workflow name and repository; combine search and selected criticality/team/monitoring filters conjunctively. Show a clear no-results state. Preserve search/filter context when returning from Detail or Add during the demonstration session.

No additional sorting or pagination behavior is implied.  
**Evidence:** E §§A.2, B.3, E.1.

## 7. Repository selection and duplicate registration

**Recommended — Pending Approval**

**Confirmed / gap:** Workflow depends on repository selection. Duplicate prevention is evidenced, but its key and scope are unspecified.

**Recommendation:**
- Start without a selected repository/workflow. Changing repository clears workflow, file and branch; metadata follows the selected workflow.
- Use an explicitly demonstrative catalog, not an implied live GitHub connection.
- Within that catalog, allow one registration per repository plus canonical full workflow path. Both Active and Paused records count as registered.
- A duplicate offers the existing Detail without creating or overwriting anything. Branch or environment does not create a separate registration.

This establishes neither enterprise uniqueness scope nor rename-safe GitHub identity.  
**Evidence:** E §§A.4, B.3, E.4.

## 8. Onboarding submission

**Recommended — Pending Approval**

**Confirmed / gap:** Registration and navigation to the created Detail are approved. The artboard is a continuous form; its prefilled values are demonstration content, not approved defaults.

**Recommendation:** Retain the continuous form. Preserve the evidenced required fields—repository, workflow, criticality, monitoring and responsible team—with environment and owners optional. Do not silently adopt sample values as defaults. Review reflects the current draft.

Validate availability and uniqueness before accepting one complete registration. Navigate only after success; failure retains the draft and creates no partial record. Repeated submission must not create duplicates. Do not simulate network operations for a local-only demonstration.  
**Evidence:** E §§A.4, B.2, E.3.

## 9. Cancellation and draft abandonment

**Recommended — Pending Approval**

**Confirmed / gap:** Cancel discards onboarding changes; confirmation, Back behavior and draft restoration are unspecified.

**Recommendation:** Cancel discards immediately and returns to inventory. Add’s “Back to Pipelines” follows the same discard rule; reopening Add starts clean. No resumable onboarding draft is promised.

A confirmation would reduce accidental loss but adds friction to an explicitly requested cancellation. This differs from leaving unsaved Detail edits through ordinary navigation.  
**Evidence:** E §§B.2–B.3, G.1.5.

## 10. Configuration history and Access

**Recommended — Pending Approval**

**Confirmed / gap:** Detail shows a latest-update summary and static capability examples. Neither a history destination nor effective authorization is defined.

**Recommendation:** Keep latest-update information consistent with demonstrated changes, distinguishing seeded examples from current demo actions. Never fabricate a signed-in actor. Present Access as illustrative information, not effective permissions; ownership changes and onboarding must not manufacture access grants. Unavailable history must not remain an active link.

**Unresolved — Requires Product Decision:** Whether full history is required now, its presentation and attribution requirements, and whether Access must represent effective permissions. The smallest recommendation is to exclude full history and authorization enforcement from the demonstration rather than invent their contracts.  
**Evidence:** E §§A.3, B.2, C.3, G.1.6–7.

## 11. GitHub links and unavailable destinations

**Recommended — Pending Approval**

**Confirmed / gap:** Repository/workflow links are designed, but authoritative destinations are absent. Nonfunctional links conflict with existing conventions.

**Recommendation:** Enable links only when a known destination is supplied; otherwise show clearly unavailable, non-interactive content. A workflow link opens source context, never executes anything. Disclose new-tab behavior accessibly when applicable.

Do not manufacture working URLs from example repository names.  
**Evidence:** E §§A.3, E.1, E.5; C §6.

## 12. Responsive behavior

**Recommended — Pending Approval**

**Confirmed / gap:** Only desktop artboards exist. Readable table scrolling, accessibility and existing sidebar behavior are established constraints; narrow-screen composition is not approved.

**Recommendation:** Fluid Detail/Add surfaces; stacked labels and controls on narrow screens; wrapping filters/actions; normal page scrolling with reachable, non-sticky form actions. Preserve inventory columns through keyboard-accessible internal horizontal scrolling—not smaller text.

Screen-specific adaptation needs approval. The exploration’s inherited sidebar-focus concern remains unverified here; this register does not establish mobile readiness.  
**Evidence:** E §§F.1–F.2; C §5; AGENTS.md, “Visual design, components, and responsiveness.”

## 13. Real integration and persistence boundaries

**Unresolved — Requires Product Decision**

Live repository/workflow discovery, authorization scope, organization catalogs, durable saves, concurrent editing and integration failure/recovery behavior have no confirmed contracts.

**Recommendation:** Keep these explicitly outside the demonstration’s guarantees. They are not reasons to invent APIs, roles or persistence behavior for the approved connected flow.  
**Evidence:** E §§C.5, E.4, G.1; README.md.

## Key Learnings:
1. Stable pipeline identity, workflow uniqueness and demonstration persistence are separate decisions; approving one does not settle the others.

No repository changes, Git operations, new Paper inspection or runtime checks were performed. All recommendations remain unapproved.