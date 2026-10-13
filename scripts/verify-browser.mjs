import { spawn, spawnSync } from "node:child_process";
const migration = spawnSync("python", ["-m", "alembic", "upgrade", "head"], {
  cwd: "apps/api",
  stdio: "inherit",
});
if (migration.status !== 0) process.exit(migration.status || 1);
const api = spawn(
  "python",
  ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
  { cwd: "apps/api", stdio: "inherit" },
);
const web = spawn(process.execPath, ["scripts/start-web.mjs"], {
  stdio: "inherit",
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const responses = await Promise.all([
        fetch("http://localhost:3000"),
        fetch("http://127.0.0.1:8000/health"),
      ]);
      if (responses.every((r) => r.ok)) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  if (!ready) throw new Error("Application did not become healthy");
  const tests = spawn(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test"],
    { stdio: "inherit" },
  );
  process.exitCode = await new Promise((resolve) =>
    tests.on("exit", (code) => resolve(code ?? 1)),
  );
} finally {
  api.kill();
  web.kill();
}
