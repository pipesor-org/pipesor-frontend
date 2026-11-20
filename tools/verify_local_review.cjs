const assert = require("node:assert/strict");
const { startLoopbackVite } = require("./loopback-vite.cjs");
const { verifyReplay } = require("./verify_incident_workspace.cjs");

async function verifyOperationalPilot(page, base, token) {
  const operations = `${base}/operations?queue=active&pilot=1`;
  await page.goto(operations);
  const key = page.getByLabel("Pipeline access token");
  const load = page.getByRole("button", { name: "Load incidents" });
  await key.fill(token);
  await load.click();
  const record = page.getByRole("link", { name: /^[0-9a-f-]{36}$/ });
  await record.waitFor();
  assert.equal(await page.getByText("INC-1042", { exact: true }).count(), 0);
  const incidentId = await record.innerText();
  await record.click();
  await page.getByRole("heading", { name: incidentId, exact: true }).waitFor();
  assert(!page.url().includes("replay="));
  await page.reload();
  await key.fill(token);
  await load.click();
  const diagnosisUnavailable = page.getByText("Diagnosis lookup is unavailable for this operational view.");
  await diagnosisUnavailable.waitFor();
  await key.fill("invalid");
  await load.click();
  await page.getByRole("alert").waitFor();
  assert.equal(await diagnosisUnavailable.count(), 0);
  await page.getByRole("link", { name: "Back to Operations" }).click();
  assert.equal(page.url(), operations);
  console.log("PILOT_CHROMIUM Operations → persistent Pipeline incident → Workspace; reload, invalid identity, no diagnostic ID");
}

async function verify() {
  const { chromium } = require(process.env.PIPESOR_PLAYWRIGHT_MODULE || "playwright");
  const vite = await startLoopbackVite();
  const browser = await chromium.launch(process.env.PIPESOR_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PIPESOR_CHROMIUM_EXECUTABLE } : {});
  try {
    const { port } = vite;
    const ids = process.env.PIPESOR_REVIEW_IDS.split(",");
    const token = process.env.PIPESOR_REVIEW_TOKEN;
    const integrated = ids.length === 1;
    const decisions = ["CONFIRMED", "CORRECTED", "REJECTED"];
    const comments = [
      "The log identifies the unresolved dependency coordinate.",
      "The log does not establish why this version was requested.",
      "The original hypothesis cannot explain the upstream cause of the request.",
    ];
    for (const [i, decision] of decisions.entries()) {
      const spanish = decision === "CORRECTED";
      const page = await browser.newPage({ viewport: { width: spanish ? 390 : 1280, height: 850 } });
      page.setDefaultTimeout(15_000);
      page.on("pageerror", error => console.error(error.message));
      page.on("response", response => {
        if (response.status() >= 500 && response.request().resourceType() === "script") {
          console.error("Browser module failed to load", new URL(response.url()).pathname, response.status());
        }
      });
      await page.addInitScript(lang => localStorage.setItem("pipesor.language", lang), spanish ? "es" : "en");
      const route = integrated ? "/operations?queue=validation&review=" : "/diagnostic-demo?review=";
      if (i === 0 && process.env.PIPESOR_OPERATIONAL_TOKEN) {
        await verifyOperationalPilot(page, `http://127.0.0.1:${port}`, process.env.PIPESOR_OPERATIONAL_TOKEN);
      }
      await page.goto(`http://127.0.0.1:${port}${route}${ids[integrated ? 0 : i]}`);
      if (integrated) {
        await page.getByRole("heading", { name: spanish ? "Diagnóstico reproducido localmente" : "Local replay diagnosis" }).waitFor();
      }
      const key = page.getByLabel(spanish ? "Token de acceso local" : "Local access token");
      const load = page.getByRole("button", { name: spanish ? "Cargar diagnóstico" : "Load diagnosis" });
      await key.focus();
      assert(await key.evaluate(element => element === document.activeElement));
      await key.fill(token);
      const loaded = page.waitForResponse(res => res.url().endsWith("/review"));
      await load.click();
      const response = await loaded;
      assert.equal(response.status(), 200);
      const before = await response.json();
      assert.equal(before.status, integrated && i > 0 ? decisions[i - 1] : "PENDING");
      const comment = integrated ? comments[i] : "Reviewed synthetic test evidence.";
      const correction = integrated ? "Check the dependency declaration and repository configuration first."
        : "Check header and include settings first.";
      const hypothesis = page.getByText(before.original.hypothesis.recommendation, { exact: true });
      await hypothesis.waitFor();
      await page.getByLabel(spanish ? "Decisión" : "Decision").selectOption(decision);
      await page.getByLabel(spanish ? "Justificación" : "Justification").fill(comment);
      if (spanish) {
        await page.getByLabel("Causa corregida").fill(integrated ? "The declared dependency could not be resolved; upstream cause unknown." : "Missing libproc.h; upstream cause unknown.");
        await page.getByLabel("Recomendación corregida (opcional)").fill(correction);
      }
      const submitted = page.waitForResponse(res => res.request().method() === "POST" && res.url().endsWith("/review"));
      await page.getByRole("button", { name: spanish ? "Guardar revisión" : "Save review" }).click();
      const reply = await submitted;
      assert.equal(reply.status(), 200);
      const review = await reply.json();
      assert.equal(review.status, decision);
      assert.deepEqual(review.original, before.original);
      assert.equal(review.history.at(-1).reviewer, "reviewer-local-01");
      assert.deepEqual(review.history.slice(0, -1), before.history);
      await page.getByText(comment, { exact: true }).waitFor();
      if (spanish) {
        await page.getByText(`Recomendación corregida (opcional): ${correction}`,
          { exact: true }).waitFor();
      }
      await hypothesis.waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.reload();
      await key.fill(token);
      const restored = page.waitForResponse(res => res.url().endsWith("/review"));
      await load.click();
      assert.equal((await (await restored).json()).status, decision);
      await page.getByText(comment, { exact: true }).waitFor();
      await key.fill("invalid");
      const denied = page.waitForResponse(res => res.url().endsWith("/review"));
      await load.click();
      assert.equal((await denied).status(), 401);
      await page.getByRole("alert").waitFor();
      assert.equal(await hypothesis.count(), 0);
      if (integrated) await verifyReplay(page, `http://127.0.0.1:${port}`, review, token, spanish);
      await page.close();
      console.log(`P3_REACT ${decision} ${spanish ? "es 390px" : "en 1280px"}; persisted history, original preserved, 401 clears view`);
    }
  } finally {
    await browser.close();
    await vite.close();
  }
}

verify().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
