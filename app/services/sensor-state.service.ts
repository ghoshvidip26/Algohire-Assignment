import type { SensorReading } from "./monitoring-store";
import { publishDashboardEvent } from "./live-events.service";
import { sensorRepo, type SensorStatus } from "../repositories/sensor.repo";

export function deriveSensorStatus(input: {
  reading: SensorReading;
  thresholdTriggered: boolean;
  spikeTriggered: boolean;
}) {
  if (input.thresholdTriggered) {
    return "critical" satisfies SensorStatus;
  }

  if (input.spikeTriggered) {
    return "warning" satisfies SensorStatus;
  }

  return "healthy" satisfies SensorStatus;
}

export async function syncSensorState(sensorId: string, nextStatus: SensorStatus, lastSeenAt?: string) {
  const currentSensor = await sensorRepo.findById(sensorId);

  const updatedSensor = await sensorRepo.updateState(sensorId, {
    status: nextStatus,
    last_seen_at: lastSeenAt ? new Date(lastSeenAt) : currentSensor.last_seen_at,
  });

  if (currentSensor.status !== updatedSensor.status) {
    publishDashboardEvent({
      type: "sensor.state_changed",
      zoneId: updatedSensor.zone_id,
      payload: {
        sensor: updatedSensor,
      },
    });
  }

  return updatedSensor;
}
