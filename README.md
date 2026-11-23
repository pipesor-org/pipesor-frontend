# Pipesor frontend

The React frontend for Pipesor, an AIOps thesis project for monitoring CI/CD workflows, triaging incidents, and reviewing operational history and AI-assisted diagnoses.

## Current state

- Signing in is connecting GitHub: `/login` starts Ingestion's GitHub flow and `/auth/complete` exchanges the one-time handoff for a short-lived session (memory + tab `sessionStorage`, no refresh). Every product route requires a session; the profile menu shows the GitHub login and signs out.
- Operations provides Active Incidents and Needs Validation read views; History provides Incidents and Insights. Pipelines includes local inventory queries, read-only Detail, and an unsaved onboarding draft.
- The interface supports English/Spanish, light/dark themes, responsive navigation, and a Not Found screen.
- Operations reads Pipeline's incident queues (`OPEN`; `RESOLVED` joined with diagnosis `PENDING` for Needs Validation) and Recommendation's diagnosis per visible row. The Incident Workspace (`/incidents/<uuid>`) shows the incident, its original run, the diagnosis (inference, observed evidence, retrieved knowledge, recommendation) and records the human review (Confirm / Reject with actual cause).
- History lists every resolved incident with its review status, diagnosis time and resolution time, and opens the Workspace. Insights computes mean diagnosis time, MTTR, confirmation rate (Corrected and Rejected count as rejected) and stage/pipeline groupings in the browser over the resolved incidents loaded in the last 30 days, stating how many it covers.
- Pipelines lists the monitored workflows, registers new ones from GitHub discovery, shows grants per person with "Grant me Operate", and lists recent failed runs with "Analyze" (capture → incident). Policy is read-only. The Workspace records remediation, verification (a successful rerun captured through Ingestion) and resolution. Assignment is not implemented.
- The diagnosis-confirmation rate reflects human reviews, not model accuracy.

See the [functional architecture map](docs/architecture/frontend-functional-map.md) for implemented routes, domain boundaries, agreed targets, and open contracts. Documented targets do not authorize new behavior or architecture.

## Requirements and getting started

Run commands from the repository root. Use Bun exclusively for dependency operations; commit `bun.lock` and keep build output and credentials out of source control.

- Bun: use the version pinned in [package.json](package.json). Dependency versions are recorded in that file and [bun.lock](bun.lock).
- Standalone [Lefthook 2.2.2](https://github.com/evilmartians/lefthook/releases/tag/v2.2.2): install the binary for your OS/architecture on `PATH` and verify `lefthook version`.
- A modern browser for local UI verification.

```sh
bun install --frozen-lockfile
bun run setup:hooks
bun run dev
```

Open `http://127.0.0.1:5173` — the services only accept that dashboard origin (CORS and the GitHub callback). In development the API origins default to the local stack (Ingestion 8081, Pipeline 8082, Recommendation 8086, see the [runtime manifest](https://github.com/pipesor-org/pipesor-docs/blob/main/docs/development/runtime-manifest.md)); builds read them from `VITE_PIPESOR_*_URL` (see [.env.example](.env.example)) and warn when they are missing. Start Vite with `bun run dev -- --host 127.0.0.1 --port 5173 --strictPort` when your default host differs. Hook setup is required once per clone; Lefthook and Commitlint run with Bun without requiring Node.js. Keep personal overrides in ignored `lefthook-local.yml`.

Paper access and agent tools are optional. Approved screenshots, specifications, and existing components provide design handoffs; request missing details rather than inventing them. Sora and JetBrains Mono load from Google Fonts through `index.html`, so those fonts may be unavailable offline.

## Verification

Before opening a PR, run the [frontend Git workflow](docs/git-workflow.md) checks:

```sh
bun run test:hooks
bun run typecheck
bun run test
bun run lint
bun run build
```

These validate accepted/rejected commit messages, TypeScript (application, Vite config and tests), unit tests of pure logic (Bun's built-in runner, `*.test.ts` next to the code), ESLint, and the production bundle. There are no component or browser tests; screens are verified manually.

After building, use `bun run preview` for manual browser verification. Follow [AGENTS.md](AGENTS.md) for the applicable navigation, EN/ES, keyboard, responsive, and design checks; build success does not establish those results.

The [Quality workflow](.github/workflows/quality.yml) checks PR commits, the PR title and prospective squash message, hook cases, typecheck, lint, and build. It also checks the latest commit on pushes to `main`.

## Repository guide

| Location | Purpose |
| --- | --- |
| `src/app/` | Application setup, routes, global styles, and design tokens |
| `src/pages/`, `src/widgets/` | Screens and composed UI sections |
| `src/entities/` | Session, incident, diagnosis, workflow-run, github-access and monitored-pipeline contracts and domain UI |
| `src/shared/` | Shared UI, the HTTP client (`shared/api`), navigation and API-origin configuration, EN/ES resources, assets, and utilities |
| `public/` | Browser-served assets |

The project follows Feature-Sliced Design. No `features/` layer is implemented; introduce one only for an approved business capability under the existing conventions.

- [Agent and engineering guidance](AGENTS.md): scope, approval boundaries, and required verification.
- [Frontend conventions](docs/frontend-conventions.md): implementation patterns, styling, localization, accessibility, and service-data rules.
- [Functional architecture map](docs/architecture/frontend-functional-map.md): detailed behavior, routes, current limitations, and target decisions.
- [Frontend Git workflow](docs/git-workflow.md): local commit constraints, PR checks, and release status.

## Deployment status

The DEV dashboard runs as an Azure Container App (pipesor-iac `workloads`): the Quality `image` job rebuilds the SPA with the DEV API origins (`PIPESOR_REQUIRE_API_ORIGINS=1` makes a build without them fail), packages it in unprivileged nginx on port 8080 ([Dockerfile](Dockerfile), [deploy/nginx.conf](deploy/nginx.conf)) and, on `main`, publishes it to GHCR by digest for `workloads.images.dashboard`. API origins are baked at build time, so each environment needs its own image.

nginx serves client routes from `index.html` (`no-store`), hashed assets as immutable, and every response with the headers in [deploy/security-headers.conf](deploy/security-headers.conf): a CSP whose `connect-src` is exactly the three API origins (`PIPESOR_CONNECT_SRC` build argument, validated), HSTS, `no-referrer` (the sign-in handoff arrives in a URL), `DENY` framing and `nosniff`. The CSP has no `'unsafe-eval'`, so Zod runs `jitless` ([src/app/zodConfig.ts](src/app/zodConfig.ts), imported first). Staged promotion beyond DEV is described in the [release guide](docs/git-workflow.md#4-releases-and-deployment).

## Contribution

Follow the [Pipesor contribution guidelines](https://github.com/pipesor-org/.github/blob/main/CONTRIBUTING.md) for short-lived branches from `main`, English Angular-style Conventional Commits, PR reviews, and squash merges. The [frontend Git workflow](docs/git-workflow.md) specifies local formatting constraints and scopes; [commitlint.config.js](commitlint.config.js) and [lefthook.yml](lefthook.yml) configure message validation.
