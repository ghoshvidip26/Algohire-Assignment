import { NextRequest, NextResponse } from "next/server";
import { createSuppression } from "@/app/services/suppression.service";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing X-User-Id header" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const result = await createSuppression({
      sensorId: body.sensorId as string,
      userId,
      startTime: body.startTime as string,
      endTime: body.endTime as string,
      reason: body.reason as string | undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
