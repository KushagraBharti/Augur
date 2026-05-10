import { spawn } from "node:child_process";

const workspace = process.env.MCP_SERVICE_NAME ? "mcp" : "workers/ingest";

const child = spawn("npm", ["--workspace", workspace, "run", "start"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

