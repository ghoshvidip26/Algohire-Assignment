import { NextRequest, NextResponse } from "next/server";
import { updateAlertStatus } from "@/app/services/alert.service";
import type { AlertStatus } from "@/app/repositories/alert.repo";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Missing X-User-Id header" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const status = body.status as AlertStatus;
    const routeParams = await params;
    await updateAlertStatus(routeParams.id, status, userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
