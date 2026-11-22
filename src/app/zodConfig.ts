import { z } from "zod";

/**
 * Imported first by `main.tsx`: Zod decides at schema construction whether to compile validators with
 * `new Function`, so this must run before any module that declares a schema is evaluated. The deployed
 * dashboard's CSP has no 'unsafe-eval'; jitless also skips Zod's eval probe, which browsers report as a
 * CSP violation even when Zod catches it.
 */
z.config({ jitless: true });
