import { NextRequest, NextResponse } from "next/server";
import { alerts, sensors } from "@/app/lib/mock-data";
import { hasDatabaseUrl, isSchemaNotReadyError } from "@/app/lib/db";
import { DEMO_USER_ID } from "@/app/lib/session";
import { getDashboardData } from "@/app/services/dashboard.service";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") ?? DEMO_USER_ID;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 401 });
    }

    if (!hasDatabaseUrl()) {
      return NextResponse.json({ sensors, alerts });
    }

    const data = await getDashboardData(userId);
    return NextResponse.json(data);
  } catch (error) {
    if (isSchemaNotReadyError(error)) {
      return NextResponse.json({ sensors, alerts });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
