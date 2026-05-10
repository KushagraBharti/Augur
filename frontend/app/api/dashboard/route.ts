import {
  fetchDashboardState,
  getUserFromBearerToken,
} from "../../../../shared/src/runtime.js";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getUserFromBearerToken(request);
    if (!user) {
      return Response.json({ error: "Sign in before viewing the dashboard." }, { status: 401 });
    }

    return Response.json(await fetchDashboardState({ userId: user.id }), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
