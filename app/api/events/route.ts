import { NextRequest } from "next/server";
import { hasDatabaseUrl, isSchemaNotReadyError } from "@/app/lib/db";
import { DEMO_USER_ID } from "@/app/lib/session";
import { alertRepo } from "@/app/repositories/alert.repo";
import { getAccessScope } from "@/app/services/authorization.service";
import { toGridAlert } from "@/app/services/dashboard.service";
import {
  subscribeToDashboardEvents,
  type DashboardEvent,
} from "@/app/services/live-events.service";

function encodeEvent(event: DashboardEvent, alertPayload?: string) {
  switch (event.type) {
    case "sensor.state_changed":
      return `data: ${JSON.stringify({
        type: "SENSOR_UPDATE",
        payload: {
          id: event.payload.sensor.id,
          status: event.payload.sensor.status,
        },
      })}\n\n`;
    case "alert.created":
      return `data: ${alertPayload}\n\n`;
    case "alert.updated":
      return `data: ${alertPayload}\n\n`;
  }
}

function createHeartbeatStream(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(": connected\n\n"));

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15_000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

async function toSocketPayload(event: DashboardEvent) {
  if (event.type === "sensor.state_changed") {
    return encodeEvent(event);
  }

  const alert = await alertRepo.getDashboardAlertById(event.payload.alert.id);
  return encodeEvent(
    event,
    JSON.stringify({
      type: event.type === "alert.created" ? "ALERT_CREATED" : "ALERT_UPDATED",
      payload: toGridAlert(alert),
    }),
  );
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") ?? DEMO_USER_ID;

  if (!userId) {
    return new Response("Missing userId", { status: 401 });
  }

  if (!hasDatabaseUrl()) {
    return createHeartbeatStream(req);
  }

  try {
    const access = await getAccessScope(userId);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        const unsubscribe = subscribeToDashboardEvents({
          zoneIds: access.zoneIds,
          isSupervisor: access.isSupervisor,
          send: (event) => {
            void toSocketPayload(event).then((payload) => {
              controller.enqueue(encoder.encode(payload));
            });
          },
        });

        controller.enqueue(encoder.encode(": connected\n\n"));

        const heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        }, 15_000);

        req.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          unsubscribe();
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (isSchemaNotReadyError(error)) {
      return createHeartbeatStream(req);
    }

    throw error;
  }
}
