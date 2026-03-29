import type { GridAlert, Sensor } from "./mock-data";

export type SocketMessage =
  | {
      type: "SENSOR_UPDATE";
      payload: Partial<Sensor> & Pick<Sensor, "id">;
    }
  | {
      type: "ALERT_CREATED" | "ALERT_UPDATED";
      payload: GridAlert;
    };

let eventSource: EventSource | null = null;

export function connectSocket(
  userId: string,
  onMessage: (data: SocketMessage) => void,
) {
  if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
    return () => undefined;
  }

  eventSource = new EventSource(
    `/api/events?userId=${encodeURIComponent(userId)}`,
  );

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data) as SocketMessage;
    onMessage(data);
  };

  eventSource.onerror = () => {
    eventSource?.close();
    eventSource = null;
  };

  return () => {
    eventSource?.close();
    eventSource = null;
  };
}
