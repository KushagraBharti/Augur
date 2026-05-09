const port = Number(process.env.PORT || 3000);
const { createServer } = await import("node:http");

createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "augur-backend" }));
    return;
  }

  res.writeHead(200, { "content-type": "text/plain" });
  res.end("Augur backend online\n");
}).listen(port, "0.0.0.0", () => {
  console.log(`Augur backend listening on ${port}`);
});
