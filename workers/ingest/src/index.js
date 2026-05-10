import {
  claimAndExecuteQueuedRuns,
  executeRun,
  queueDueLiveMonitorRun,
} from "../../../shared/src/runtime.js";

const port = Number(process.env.PORT || 3000);
const pollMs = Number(process.env.AUGUR_WORKER_POLL_MS || 15_000);
const liveMonitorEnabled = process.env.AUGUR_LIVE_MONITOR_ENABLED === "true";
const liveMonitorMinHours = Number(process.env.AUGUR_LIVE_MONITOR_MIN_HOURS || 20);
let running = false;

const server = BunAvailable()
  ? null
  : (await import("node:http")).createServer((req, res) => {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

      if (url.pathname === "/health") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            ok: true,
            service: "augur-worker",
            pollMs,
            running,
            liveMonitorEnabled,
            liveMonitorMinHours,
          })
        );
        return;
      }

      if (url.pathname === "/run" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", async () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            if (!parsed.runId) {
              res.writeHead(400, { "content-type": "application/json" });
              res.end(JSON.stringify({ ok: false, error: "Missing runId" }));
              return;
            }
            await executeRun(parsed.runId);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, runId: parsed.runId }));
          } catch (error) {
            res.writeHead(500, { "content-type": "application/json" });
            res.end(
              JSON.stringify({
                ok: false,
                error: error instanceof Error ? error.message : String(error),
              })
            );
          }
        });
        return;
      }

      res.writeHead(200, { "content-type": "text/plain" });
      res.end("Augur worker online\n");
    });

if (server) {
  server.listen(port, "0.0.0.0", () => {
    console.log(`Augur worker listening on ${port}`);
  });
}

async function tick() {
  if (running) {
    return;
  }
  running = true;
  try {
    if (liveMonitorEnabled) {
      const monitor = await queueDueLiveMonitorRun({ minHoursBetweenRuns: liveMonitorMinHours });
      if (monitor.queued) {
        console.log(`Augur worker queued scheduled live monitor ${monitor.run.id}`);
      }
    }
    const claimed = await claimAndExecuteQueuedRuns(1);
    if (claimed > 0) {
      console.log(`Augur worker completed ${claimed} queued run(s)`);
    }
  } catch (error) {
    console.error("Augur worker tick failed", error);
  } finally {
    running = false;
  }
}

setInterval(tick, pollMs);
void tick();

function BunAvailable() {
  return false;
}
