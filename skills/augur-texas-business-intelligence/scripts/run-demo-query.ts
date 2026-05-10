#!/usr/bin/env node

const endpoint = process.env.AUGUR_MCP_URL ?? "https://augur-mcp-production.up.railway.app/mcp";

async function rpc(method, params = undefined) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      method,
      params,
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 500)}`);
  }
  const eventLine = text
    .split(/\r?\n/)
    .find((line) => line.startsWith("data:"));
  return JSON.parse((eventLine ? eventLine.slice(5) : text).trim());
}

async function main() {
  const initialize = await rpc("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: {
      name: "augur-skill-demo-query",
      version: "0.1.0",
    },
  });

  const tools = await rpc("tools/list");
  const resources = await rpc("resources/list");

  console.log(
    JSON.stringify(
      {
        endpoint,
        server: initialize.result?.serverInfo,
        tools: tools.result?.tools?.map((tool) => tool.name),
        resources: resources.result?.resources?.map((resource) => resource.uri),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
