const port = Number(process.env.PORT || 3000);

const server = BunAvailable()
  ? null
  : (await import("node:http")).createServer((req, res) => {
      if (req.url === "/health") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, service: "augur-worker" }));
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

function BunAvailable() {
  return false;
}
