const assert = require("node:assert/strict");
const path = require("node:path");

const apiPath = "/local-demo/v1/diagnosis";

async function verify() {
  const { chromium } = require(process.env.PIPESOR_PLAYWRIGHT_MODULE || "playwright");
  const { createServer } = await import("vite");
  const root = path.resolve(__dirname, "..");
  assert(process.env.PIPESOR_DEMO_PORT && process.env.PIPESOR_DEMO_TOKEN, "Run through the owner-chain harness");
  const vite = await createServer({ root, server: { host: "127.0.0.1", port: 0 } });
  const browser = await chromium.launch();
  try {
    await vite.listen();
    const { port } = vite.httpServer.address();
    for (const [language, width, tokenLabel, loadLabel, rejection] of [
      ["en", 1280, "Local access token", "Load diagnosis", "The access token was rejected."],
      ["es", 390, "Token de acceso local", "Cargar diagnóstico", "Se rechazó el token de acceso."],
    ]) {
      const page = await browser.newPage({ viewport: { width, height: 850 } });
      page.setDefaultTimeout(15_000);
      await page.addInitScript((lang) => localStorage.setItem("pipesor.language", lang), language);
      await page.goto(`http://127.0.0.1:${port}/diagnostic-demo`, { waitUntil: "domcontentloaded" });
      const input = page.getByLabel(tokenLabel);
      const load = page.getByRole("button", { name: loadLabel });
      await input.focus();
      assert(await input.evaluate((element) => element === document.activeElement));

      await input.fill(process.env.PIPESOR_DEMO_TOKEN);
      const accepted = page.waitForResponse((response) => new URL(response.url()).pathname === apiPath);
      await load.click();
      const response = await accepted;
      assert.equal(response.status(), 200);
      assert.match(response.headers()["cache-control"], /no-store/);
      const output = await response.json();
      const cause = page.getByText(output.hypothesis.probableCause, { exact: true });
      await cause.waitFor();
      for (const value of [
        output.hypothesis.recommendation, output.hypothesis.limitations, output.correlationId,
        output.incidentId, output.executionId,
        output.evidence[0].content, output.evidence[0].evidenceId,
        output.sources[0].provenance, output.sources[0].documentId, output.sources[0].chunkId,
      ]) {
        await page.getByText(value, { exact: true }).waitFor();
      }
      if (output.evidence[0].sourceLocator) {
        await page.getByText(output.evidence[0].sourceLocator, { exact: true }).waitFor();
      }
      assert.equal(output.evidence[0].originContextId, output.contextId);
      assert.equal(await page.getByText(output.contextId, { exact: true }).count(), 2);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

      await input.fill("invalid");
      const denied = page.waitForResponse((reply) => new URL(reply.url()).pathname === apiPath);
      await load.click();
      assert.equal((await denied).status(), 401);
      assert.equal(await page.getByRole("alert").textContent(), rejection);
      assert.equal(await cause.count(), 0);
      await page.close();
      console.log(`PIPESOR_DIAGNOSTIC_BROWSER ${language} ${width}px: HTTP 200 with provenance, HTTP 401 clears result`);
    }
  } finally {
    await browser.close();
    await vite.close();
  }
}

verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
