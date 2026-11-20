const assert = require("node:assert/strict");
const path = require("node:path");

async function verify() {
  const restart = process.argv[2] === "restart";
  const { chromium } = require(process.env.PIPESOR_PLAYWRIGHT_MODULE || "playwright");
  const { createServer } = await import("vite");
  const vite = await createServer({ root: path.resolve(__dirname, ".."), server: { port: 0 } });
  const browser = await chromium.launch();
  try {
    await vite.listen();
    const base = `http://127.0.0.1:${vite.httpServer.address().port}`;
    const page = await browser.newPage({ viewport: { width: restart ? 390 : 1440, height: 900 } });
    page.setDefaultTimeout(12_000);
    await page.addInitScript(language => localStorage.setItem("pipesor.language", language), restart ? "es" : "en");
    page.on("pageerror", error => console.error(error.message));
    const token = process.env.PIPESOR_REGISTRATION_TOKEN;
    async function connect(bearer = token) {
      await page.getByLabel(restart ? "Token de prueba de Pipeline" : "Pipeline test access token").fill(bearer);
      await page.getByRole("button", { name: restart ? "Abrir piloto" : "Open pilot" }).click();
    }
    const add = page.getByRole("link", { name: "Add monitored workflow" });
    const submit = page.getByRole("button", { name: "Add monitored workflow" });
    async function draft() {
      await add.click();
      await submit.waitFor();
      assert(await submit.isDisabled());
      await page.locator("#add-repository").selectOption("pilot/reporting-service");
      await page.locator("#add-workflowPath").selectOption(".github/workflows/integration-checks.yml");
      await page.locator("#add-criticality").selectOption("High");
      await page.locator("#add-operationalEnvironment").selectOption("QA");
      await page.getByRole("radio", { name: "Active", exact: true }).check();
      await page.locator("#add-responsibleTeam").selectOption("team-platform");
    }
    const heading = page.getByRole("heading", { name: "integration-checks", exact: true });
    await page.goto(base + "/pipelines");
    await connect();
    if (!restart) {
      await draft();
      const created = page.waitForResponse(res => res.request().method() === "POST");
      await submit.click();
      assert.equal((await created).status(), 201);
      await heading.waitFor();
      await page.locator('select[name="monitoringStatus"]').selectOption("PAUSED");
      const updated = page.waitForResponse(res => res.request().method() === "PUT");
      await page.getByRole("button", { name: "Save policy" }).click();
      assert.equal((await updated).status(), 200);
      await page.getByText("Paused", { exact: true }).filter({ visible: true }).first().waitFor();
      await page.getByRole("link", { name: /Back to Pipelines/ }).click();
      await draft();
      const duplicate = page.waitForResponse(res => res.request().method() === "POST");
      await submit.click();
      assert.equal((await duplicate).status(), 409);
      await page.getByRole("alert").getByText("This workflow is already monitored.").waitFor();
      await page.goto(base + "/pipelines");
      await connect();
    }
    const row = page.getByRole("link", { name: /Integration checks/ });
    await row.waitFor();
    await page.reload();
    await connect();
    await row.click();
    await heading.waitFor();
    assert(await heading.evaluate(node => node === document.activeElement));
    await page.getByText("pilot/reporting-service", { exact: true }).first().waitFor();
    await page.getByText("qa", { exact: true }).waitFor();
    await page.getByText(restart ? "Pausado" : "Paused", { exact: true }).first().waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (!restart) {
      await page.route("**/api/v1/pipelines?*", route => route.fulfill({ status: 503 }));
      await page.getByRole("link", { name: /Back to Pipelines/ }).click();
      await page.getByRole("alert").getByText("Pipeline or GitHub authority is unavailable.").waitFor();
      assert.equal(await row.count(), 0);
      assert.equal(await page.getByText("deploy-production", { exact: true }).count(), 0);
    }
    console.log(`WORKFLOW_REGISTRATION ${restart ? "ES 390px after backend restart" : "EN 1440px created, edited, duplicate and injected outage"}; persisted inventory/detail after reload`);
  } finally {
    await browser.close();
    await vite.close();
  }
}

verify().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
