import type { GridAlert, Sensor } from "../lib/mock-data";
import {
  alertRepo,
  type DashboardAlertRecord,
} from "../repositories/alert.repo";
import { sensorRepo } from "../repositories/sensor.repo";
import { assertHasAssignedZones } from "./authorization.service";

export function toRelativeTimestamp(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day ago`;
}

export function toGridAlert(alert: DashboardAlertRecord): GridAlert {
  return {
    id: alert.id,
    sensorId: alert.sensor_id,
    sensorName: alert.sensor_name,
    severity: alert.severity === "critical" ? "high" : alert.severity,
    status: alert.status,
    message: alert.suppressed ? `${alert.message} (suppressed)` : alert.message,
    timestamp: toRelativeTimestamp(alert.created_at),
  };
}

export async function getDashboardData(userId: string) {
  const access = await assertHasAssignedZones(userId);
  const [sensors, alerts] = await Promise.all([
    sensorRepo.getDashboardSensors(access),
    alertRepo.getDashboardAlerts(access),
  ]);

  return {
    sensors: sensors.map(
      (sensor) =>
        ({
          id: sensor.id,
          name: sensor.name,
          location: sensor.location,
          status: sensor.status,
          voltage: sensor.voltage,
          current: sensor.current,
          temperature: sensor.temperature,
          trend: sensor.trend,
        }) satisfies Sensor,
    ),
    alerts: alerts.map(
      (alert) => toGridAlert(alert),
    ),
  };
}
