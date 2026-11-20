const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs/promises");
const os = require("node:os");

async function startLoopbackVite() {
  const { createServer } = await import("vite");
  const cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), "pipesor-vite-"));
  const vite = await createServer({
    root: path.resolve(__dirname, ".."),
    cacheDir,
    server: { middlewareMode: true, hmr: false },
  });
  const server = http.createServer(vite.middlewares);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    port: server.address().port,
    async close() {
      await new Promise(resolve => server.close(resolve));
      await vite.close();
      await fs.rm(cacheDir, { recursive: true, force: true });
    },
  };
}

module.exports = { startLoopbackVite };
