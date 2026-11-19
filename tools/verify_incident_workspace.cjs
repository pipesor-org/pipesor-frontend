const assert = require("node:assert/strict");
const path = require("node:path");

async function verifyReplay(page, base, view, token, spanish) {
  const id = view.original.incidentId;
  const endpoint = `/local-demo/v1/diagnoses/${view.diagnosticId}/review`;
  const workspace = `${base}/incidents/${id}?replay=${view.diagnosticId}`;
  const hypothesis = page.getByText(view.original.hypothesis.probableCause, { exact: true });
  const key = page.getByLabel(spanish ? "Token de acceso local" : "Local access token");
  const load = page.getByRole("button", { name: spanish ? "Cargar diagnóstico" : "Load diagnosis" });
  async function read(bearer, status) {
    await key.fill(bearer);
    const response = page.waitForResponse(res => res.url().endsWith(endpoint));
    await load.click();
    assert.equal((await response).status(), status);
  }
  await page.goto(workspace);
  await read(token, 200);
  await hypothesis.waitFor();
  await page.getByText(view.history.at(-1).comment, { exact: true }).waitFor();
  assert.equal(await page.getByRole("button", { name: spanish ? "Guardar revisión" : "Save review" }).count(), 0);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.reload();
  assert.equal(await hypothesis.count(), 0);
  await read(token, 200);
  await hypothesis.waitFor();
  await read("fixture-other-scope", 404);
  await page.getByRole("alert").waitFor();
  assert.equal(await hypothesis.count(), 0);
  await read("invalid", 401);
  await page.getByRole("alert").waitFor();
  await page.route(`**${endpoint}`, route => route.fulfill({ status: 503 }));
  await read(token, 503);
  await page.getByText(spanish ? "El servicio de diagnóstico no está disponible. Inténtalo de nuevo."
    : "The diagnostic service is unavailable. Try again.").waitFor();
  assert.equal(await hypothesis.count(), 0);
  await page.unroute(`**${endpoint}`);
  await page.goto(workspace.replace(id, "00000000-0000-0000-0000-000000000001"));
  await read(token, 200);
  await page.getByRole("alert").waitFor();
  assert.equal(await hypothesis.count(), 0);
  console.log(`WORKSPACE_E02 ${spanish ? "es 390px" : "en 1280px"}; persisted diagnosis and review, reload, 401/404, injected 503 and incident mismatch`);
}

async function verifyFixtures() {
  const { chromium } = require(process.env.PIPESOR_PLAYWRIGHT_MODULE || "playwright");
  const { createServer } = await import("vite");
  const vite = await createServer({ root: path.resolve(__dirname, ".."), server: { host: "127.0.0.1", port: 0 } });
  const browser = await chromium.launch();
  try {
    await vite.listen();
    const base = `http://127.0.0.1:${vite.httpServer.address().port}`;
    for (const [lang, width] of [["en", 1440], ["es", 390]]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.addInitScript(language => localStorage.setItem("pipesor.language", language), lang);
      for (const [source, id] of [
        ["/operations?queue=active", "INC-1042"],
        ["/operations?queue=validation", "INC-1039"],
        ["/history?view=incidents", "INC-1038"],
      ]) {
        await page.goto(base + source);
        const link = page.getByRole("link", { name: id });
        await link.focus();
        await page.keyboard.press("Enter");
        const heading = page.getByRole("heading", { level: 1, name: new RegExp(id) });
        await heading.waitFor();
        assert(await heading.evaluate(node => document.activeElement === node));
        await page.reload();
        await heading.waitFor();
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        if (id === "INC-1039") {
          await page.getByText("npm ERR! ERESOLVE unable to resolve dependency tree", { exact: true }).waitFor();
          if (process.env.PIPESOR_WORKSPACE_SCREENSHOTS) {
            await page.screenshot({ path: path.join(process.env.PIPESOR_WORKSPACE_SCREENSHOTS, `workspace-${lang}.png`), fullPage: true });
          }
        }
        await page.getByRole("link", { name: lang === "es" ? /^Volver a/ : /^Back to/ }).click();
        assert.equal(page.url(), base + source);
      }
      await page.goto(`${base}/incidents/INC-0?from=https%3A%2F%2Fexample.invalid`);
      await page.getByRole("heading", { name: lang === "es" ? "Incidente no disponible" : "Incident unavailable" }).waitFor();
      await page.getByRole("link", { name: lang === "es" ? "Volver a Operaciones" : "Back to Operations" }).click();
      assert.equal(page.url(), `${base}/operations?queue=active`);
      await page.close();
      console.log(`WORKSPACE_FIXTURES ${lang} ${width}px; three entry points, keyboard focus, reload, origin return and unknown ID`);
    }
  } finally {
    await browser.close();
    await vite.close();
  }
}

module.exports = { verifyReplay };

if (require.main === module) verifyFixtures().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
