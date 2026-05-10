import {
  createCompanyForUser,
  getUserFromBearerToken,
} from "../../../../shared/src/runtime.js";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getUserFromBearerToken(request);
    if (!user) {
      return Response.json({ error: "Sign in before creating a company." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const company = await createCompanyForUser({
      user,
      name: body.name,
      vertical: body.vertical,
      businessGoal: body.businessGoal,
      targetCities: body.targetCities,
    });

    return Response.json({ company }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

