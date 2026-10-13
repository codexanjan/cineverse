import { cpSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const web = resolve(root, "apps/web");
const standalone = resolve(web, ".next/standalone/apps/web");
const server = resolve(standalone, "server.js");
if (!existsSync(server))
  throw new Error("Run npm run build before starting the production server.");
cpSync(resolve(web, "public"), resolve(standalone, "public"), {
  recursive: true,
});
cpSync(resolve(web, ".next/static"), resolve(standalone, ".next/static"), {
  recursive: true,
});
const child = spawn(process.execPath, [server], {
  cwd: standalone,
  stdio: "inherit",
  env: {
    ...process.env,
    HOSTNAME: process.env.HOSTNAME || "127.0.0.1",
    PORT: process.env.PORT || "3000",
  },
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => {
  process.exitCode = code ?? 0;
});
