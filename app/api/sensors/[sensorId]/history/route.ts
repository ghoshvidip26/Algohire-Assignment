import { NextRequest, NextResponse } from "next/server";
import { getSensorHistory } from "@/app/services/history.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sensorId: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing X-User-Id header" },
        { status: 401 },
      );
    }

    const routeParams = await params;
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json(
        { error: "Both from and to are required" },
        { status: 400 },
      );
    }

    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const pageSize = Number(req.nextUrl.searchParams.get("pageSize") ?? "100");

    const history = await getSensorHistory({
      sensorId: routeParams.sensorId,
      userId,
      from,
      to,
      page,
      pageSize,
    });

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
