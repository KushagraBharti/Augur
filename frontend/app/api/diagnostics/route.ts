import { runDiagnostics } from "../../../lib/diagnostics";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await runDiagnostics();

  return Response.json(report, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
