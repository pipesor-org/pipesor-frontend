const assert = require("node:assert/strict");
const path = require("node:path");
const { verifyReplay } = require("./verify_incident_workspace.cjs");

async function verify() {
  const { chromium } = require(process.env.PIPESOR_PLAYWRIGHT_MODULE || "playwright");
  const { createServer } = await import("vite");
  const vite = await createServer({ root: path.resolve(__dirname, ".."), server: { port: 0 } });
  const browser = await chromium.launch(process.env.PIPESOR_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PIPESOR_CHROMIUM_EXECUTABLE } : {});
  try {
    await vite.listen();
    const { port } = vite.httpServer.address();
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
      await page.addInitScript(lang => localStorage.setItem("pipesor.language", lang), spanish ? "es" : "en");
      const route = integrated ? "/operations?queue=validation&review=" : "/diagnostic-demo?review=";
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
