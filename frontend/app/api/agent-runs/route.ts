import {
  createAskRun,
  executeRun,
  fetchRunsForContext,
  getUserFromBearerToken,
} from "../../../../shared/src/runtime.js";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getUserFromBearerToken(request);
    if (!user) {
      return Response.json({ error: "Sign in before viewing agent runs." }, { status: 401 });
    }

    return Response.json(await fetchRunsForContext({ userId: user.id }), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromBearerToken(request);
    if (!user) {
      return Response.json({ error: "Sign in before creating an agent run." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const run = await createAskRun({
      prompt: body.prompt,
      userId: user.id,
      companyId: body.companyId ?? null,
      mode: body.mode ?? "ask",
      signalWindow: body.signalWindow ?? null,
    });

    if (process.env.AUGUR_INLINE_RUNS === "true") {
      void executeRun(run.id);
    }

    return Response.json({ run }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
