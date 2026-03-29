import type { AlertRecord } from "../repositories/alert.repo";
import type { SensorRecord } from "../repositories/sensor.repo";

export type DashboardEvent =
  | {
      type: "sensor.state_changed";
      zoneId: string;
      payload: {
        sensor: SensorRecord;
      };
    }
  | {
      type: "alert.created";
      zoneId: string;
      payload: {
        alert: AlertRecord;
      };
    }
  | {
      type: "alert.updated";
      zoneId: string;
      payload: {
        alert: AlertRecord;
      };
    };

type Subscriber = {
  id: string;
  send: (event: DashboardEvent) => void;
  zoneIds: string[];
  isSupervisor: boolean;
};

const subscribers = new Map<string, Subscriber>();

export function subscribeToDashboardEvents(input: {
  zoneIds: string[];
  isSupervisor: boolean;
  send: (event: DashboardEvent) => void;
}) {
  const id = crypto.randomUUID();
  subscribers.set(id, {
    id,
    zoneIds: input.zoneIds,
    isSupervisor: input.isSupervisor,
    send: input.send,
  });

  return () => {
    subscribers.delete(id);
  };
}

export function publishDashboardEvent(event: DashboardEvent) {
  subscribers.forEach((subscriber) => {
    if (subscriber.isSupervisor || subscriber.zoneIds.includes(event.zoneId)) {
      subscriber.send(event);
    }
  });
}
