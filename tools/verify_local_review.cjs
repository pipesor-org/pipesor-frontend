const assert = require("node:assert/strict");
const path = require("node:path");

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
    for (const [i, decision] of ["CONFIRMED", "CORRECTED", "REJECTED"].entries()) {
      const spanish = decision === "CORRECTED";
      const page = await browser.newPage({ viewport: { width: spanish ? 390 : 1280, height: 850 } });
      page.setDefaultTimeout(15_000);
      await page.addInitScript(lang => localStorage.setItem("pipesor.language", lang), spanish ? "es" : "en");
      await page.goto(`http://127.0.0.1:${port}/diagnostic-demo?review=${ids[i]}`);
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
      assert.equal(before.status, "PENDING");
      const hypothesis = page.getByText(before.original.hypothesis.recommendation, { exact: true });
      await hypothesis.waitFor();
      await page.getByLabel(spanish ? "Decisión" : "Decision").selectOption(decision);
      await page.getByLabel(spanish ? "Justificación" : "Justification").fill("Reviewed synthetic test evidence.");
      if (spanish) {
        await page.getByLabel("Causa corregida").fill("Missing libproc.h; upstream cause unknown.");
        await page.getByLabel("Recomendación corregida (opcional)").fill("Check header and include settings first.");
      }
      const submitted = page.waitForResponse(res => res.request().method() === "POST" && res.url().endsWith("/review"));
      await page.getByRole("button", { name: spanish ? "Guardar revisión" : "Save review" }).click();
      const reply = await submitted;
      assert.equal(reply.status(), 200);
      const review = await reply.json();
      assert.equal(review.status, decision);
      assert.deepEqual(review.original, before.original);
      assert.equal(review.history[0].reviewer, "reviewer-local-01");
      await page.getByText("Reviewed synthetic test evidence.", { exact: true }).waitFor();
      if (spanish) {
        await page.getByText("Recomendación corregida (opcional): Check header and include settings first.",
          { exact: true }).waitFor();
      }
      await hypothesis.waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const restored = page.waitForResponse(res => res.url().endsWith("/review"));
      await load.click();
      assert.equal((await (await restored).json()).status, decision);
      await page.getByText("Reviewed synthetic test evidence.", { exact: true }).waitFor();
      await key.fill("invalid");
      const denied = page.waitForResponse(res => res.url().endsWith("/review"));
      await load.click();
      assert.equal((await denied).status(), 401);
      await page.getByRole("alert").waitFor();
      assert.equal(await hypothesis.count(), 0);
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
