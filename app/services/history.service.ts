import { readingRepo } from "../repositories/reading.repo";
import { sensorRepo } from "../repositories/sensor.repo";
import { assertHasAssignedZones } from "./authorization.service";

export async function getSensorHistory(input: {
  sensorId: string;
  userId: string;
  from: string;
  to: string;
  page?: number;
  pageSize?: number;
}) {
  const access = await assertHasAssignedZones(input.userId);
  await sensorRepo.findByIdForAccess(input.sensorId, access);

  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 100;
  const result = await readingRepo.getSensorHistory({
    sensorId: input.sensorId,
    from: input.from,
    to: input.to,
    page,
    pageSize,
  });

  return {
    sensorId: input.sensorId,
    from: input.from,
    to: input.to,
    page,
    pageSize,
    total: result.total,
    readings: result.rows.map((row) => ({
      id: row.id,
      sensorId: row.sensor_id,
      voltage: row.voltage,
      temperature: row.temperature,
      current: row.current,
      recordedAt: row.recorded_at,
      triggeredAnomaly: (row.anomaly_ids?.length ?? 0) > 0,
      anomalies: (row.anomaly_ids ?? []).map((anomalyId, index) => ({
        id: anomalyId,
        type: row.anomaly_types?.[index] ?? "UNKNOWN",
        alertId: row.alert_ids?.[index] ?? null,
      })),
    })),
  };
}
