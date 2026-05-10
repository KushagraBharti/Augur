#!/usr/bin/env node
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { z } from "zod";
import {
  createDemoRun,
  executeRun,
  fetchDashboardState,
  fetchRunState,
  getSupabaseAdmin,
  TARGET_CITIES,
} from "../../shared/src/runtime.js";

function jsonContent(value) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

function createAugurServer() {
const server = new McpServer({
  name: "augur-texas-intelligence",
  version: "0.1.0",
});

server.tool(
  "augur.generate_business_brief",
  "Create and execute an Augur Analyst run for the LoneStar Retail Group demo company.",
  {
    prompt: z.string().optional(),
    mode: z.enum(["ask", "live_monitor", "replay_monitor"]).optional(),
  },
  async ({ prompt, mode = "ask" }) => {
    const run = await createDemoRun({ prompt, mode });
    await executeRun(run.id);
    return jsonContent(await fetchRunState(run.id, { companyId: run.company_id }));
  }
);

server.tool(
  "augur.compare_expansion_signals",
  "Return the latest city-level Augur expansion scores and source-backed report state.",
  {},
  async () => jsonContent(await fetchDashboardState())
);

server.tool(
  "augur.search_texas_bills",
  "Return bill evidence from the latest Augur run or create a fresh source-backed run if requested.",
  {
    fresh: z.boolean().optional(),
  },
  async ({ fresh }) => {
    if (fresh) {
      const run = await createDemoRun({
        prompt: "Search Texas bills relevant to permitting, zoning, land use, property tax, parking, signage, and development incentives.",
      });
      await executeRun(run.id);
      return jsonContent(await fetchRunState(run.id, { companyId: run.company_id }));
    }
    const dashboard = await fetchDashboardState();
    return jsonContent({
      latestRun: dashboard.latestRun,
      latestReport: dashboard.latestReport,
      policySources: dashboard.sources.filter((source) =>
        ["legislation", "legislation_change_feed", "legislation_documents"].includes(
          source.source_type
        )
      ),
    });
  }
);

server.tool(
  "augur.get_texas_bill_documents",
  "Return official Texas Legislature Online document evidence from the latest run.",
  {},
  async () => {
    const dashboard = await fetchDashboardState();
    if (!dashboard.latestRun?.id) {
      return jsonContent({ error: "No Augur run exists yet." });
    }
    const state = await fetchRunState(dashboard.latestRun.id, { companyId: dashboard.company.id });
    return jsonContent({
      run: state.run,
      documents: state.evidence.filter((item) => item.evidence_type === "official_bill_document"),
    });
  }
);

server.tool(
  "augur.query_city_dataset",
  "Return latest city evidence, scores, and source registry rows for Austin, Dallas, Houston, and San Antonio.",
  {
    city: z.enum(["Austin", "Dallas", "Houston", "San Antonio"]).optional(),
  },
  async ({ city }) => {
    const dashboard = await fetchDashboardState();
    const state = dashboard.latestRun?.id ? await fetchRunState(dashboard.latestRun.id, { companyId: dashboard.company.id }) : null;
    return jsonContent({
      scores: city ? dashboard.scores.filter((score) => score.city === city) : dashboard.scores,
      evidence: city
        ? state?.evidence.filter((item) =>
            item.title.toLowerCase().includes(city.toLowerCase())
          )
        : state?.evidence,
      sources: dashboard.sources.filter((source) => !city || source.city === city),
    });
  }
);

server.tool(
  "augur.search_lobby_activity",
  "Return Texas Ethics Commission evidence from the latest Augur run.",
  {},
  async () => {
    const dashboard = await fetchDashboardState();
    if (!dashboard.latestRun?.id) {
      return jsonContent({ error: "No Augur run exists yet." });
    }
    const state = await fetchRunState(dashboard.latestRun.id, { companyId: dashboard.company.id });
    return jsonContent({
      run: state.run,
      lobbyEvidence: state.evidence.filter((item) =>
        item.evidence_type.includes("lobby")
      ),
      sources: dashboard.sources.filter((source) => source.source_type.includes("lobby")),
    });
  }
);

server.resource("augur.sources", "augur://sources", async () => {
  const dashboard = await fetchDashboardState();
  return {
    contents: [
      {
        uri: "augur://sources",
        mimeType: "application/json",
        text: JSON.stringify(dashboard.sources, null, 2),
      },
    ],
  };
});

server.resource("augur.latest-report", "augur://latest-report", async () => {
  const dashboard = await fetchDashboardState();
  return {
    contents: [
      {
        uri: "augur://latest-report",
        mimeType: "text/markdown",
        text: dashboard.latestReport?.markdown ?? "No Augur report has been generated yet.",
      },
    ],
  };
});

server.resource(
  "augur.company",
  new ResourceTemplate("augur://company/{slug}", { list: undefined }),
  async (_uri, { slug }) => {
    const dashboard = await fetchDashboardState();
    return {
      contents: [
        {
          uri: `augur://company/${slug}`,
          mimeType: "application/json",
          text: JSON.stringify(dashboard.company, null, 2),
        },
      ],
    };
  }
);

server.resource("augur.company.lonestar", "augur://company/lonestar-retail-group", async () => {
  const dashboard = await fetchDashboardState();
  return {
    contents: [
      {
        uri: "augur://company/lonestar-retail-group",
        mimeType: "application/json",
        text: JSON.stringify(dashboard.company, null, 2),
      },
    ],
  };
});

server.resource("augur.schema", "augur://schema", async () => {
  const supabase = getSupabaseAdmin();
  const tables = [
    "companies",
    "data_sources",
    "raw_records",
    "city_records",
    "bills",
    "bill_documents",
    "lobby_records",
    "agent_runs",
    "agent_tool_calls",
    "evidence_items",
    "signal_scores",
    "reports",
    "contact_paths",
  ];
  return {
    contents: [
      {
        uri: "augur://schema",
        mimeType: "application/json",
        text: JSON.stringify({ tables, projectRef: process.env.SUPABASE_PROJECT_REF }, null, 2),
      },
    ],
  };
});

server.resource("augur.scoring-model", "augur://scoring-model", async () => ({
  contents: [
    {
      uri: "augur://scoring-model",
      mimeType: "text/markdown",
      text:
        "# Augur Scoring Model\n\nScores are 0-100 dashboard compressions assigned through the `update_signal_scores` tool. They must cite evidence IDs, distinguish confidence from signal strength, and lower confidence when source calls fail or connectors are weaker.",
    },
  ],
}));

return server;
}

if (process.env.PORT && process.env.MCP_TRANSPORT !== "stdio") {
  const allowedHosts = [
    "localhost",
    `localhost:${process.env.PORT}`,
    "127.0.0.1",
    `127.0.0.1:${process.env.PORT}`,
    process.env.RAILWAY_PUBLIC_DOMAIN,
    process.env.RAILWAY_STATIC_URL,
    process.env.RAILWAY_SERVICE_AUGUR_MCP_URL,
  ].filter(Boolean);
  const app = createMcpExpressApp({ host: "0.0.0.0", allowedHosts });
  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "augur-mcp",
      transport: "streamable-http",
      endpoint: "/mcp",
    });
  });
  app.post("/mcp", async (req, res) => {
    const server = createAugurServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        void transport.close();
        void server.close();
      });
    } catch (error) {
      console.error("Augur MCP request failed", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });
  app.get("/mcp", (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Use POST for Streamable HTTP MCP." },
      id: null,
    });
  });
  app.listen(Number(process.env.PORT), "0.0.0.0", () => {
    console.log(`Augur MCP listening on ${process.env.PORT}`);
  });
} else {
  const server = createAugurServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
