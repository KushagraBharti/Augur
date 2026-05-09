import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const baseEnv = {
  ...process.env,
  ...readEnvFile(resolve(root, ".env.local")),
};

const services = [
  {
    name: "frontend",
    command: "npm --workspace frontend run dev -- -p 3000",
    env: baseEnv,
    url: "http://localhost:3000",
  },
  {
    name: "backend",
    command: "npm --workspace backend run start",
    env: { ...baseEnv, PORT: "3010" },
    url: "http://localhost:3010/health",
  },
  {
    name: "worker",
    command: "npm --workspace workers/ingest run start",
    env: { ...baseEnv, PORT: "3020" },
    url: "http://localhost:3020/health",
  },
];

const children = services.map(startService);

console.log("\nAugur dev services");
for (const service of services) {
  console.log(`- ${service.name}: ${service.url}`);
}
console.log("\nPress Ctrl+C to stop all services.\n");

let shuttingDown = false;

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    for (const child of children) {
      child.kill(signal);
    }
  });
}

function startService(service) {
  const child = spawn(service.command, {
    cwd: root,
    env: service.env,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  pipeWithPrefix(child.stdout, service.name);
  pipeWithPrefix(child.stderr, service.name);

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.log(`[${service.name}] exited with ${reason}`);
  });

  return child;
}

function pipeWithPrefix(stream, name) {
  let buffer = "";

  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.length > 0) {
        console.log(`[${name}] ${line}`);
      }
    }
  });
}

function readEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  const parsed = {};
  const content = readFileSync(path, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    parsed[key] = unquote(rawValue);
  }

  return parsed;
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
