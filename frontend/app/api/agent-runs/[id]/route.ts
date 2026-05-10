import {
  fetchRunState,
  getUserFromBearerToken,
} from "../../../../../shared/src/runtime.js";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromBearerToken(request);
    if (!user) {
      return Response.json({ error: "Sign in before viewing an agent run." }, { status: 401 });
    }

    const { id } = await context.params;
    return Response.json(await fetchRunState(id, { userId: user.id }), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
