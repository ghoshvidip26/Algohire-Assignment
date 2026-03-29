import { anomalyRepo } from "../repositories/anomaly.repo";
import { alertRepo, type AlertSeverity, type AlertStatus } from "../repositories/alert.repo";
import { auditRepo } from "../repositories/audit.repo";
import { sensorRepo } from "../repositories/sensor.repo";
import { assertHasAssignedZones } from "./authorization.service";
import { publishDashboardEvent } from "./live-events.service";
import {
  checkSuppression,
  type AnomalyType,
  type SensorReading,
} from "./monitoring-store";

const validTransitions: Record<AlertStatus, AlertStatus[]> = {
  open: ["acknowledged", "resolved"],
  acknowledged: ["resolved"],
  resolved: [],
};

function getSeverityForAnomaly(type: AnomalyType): AlertSeverity {
  switch (type) {
    case "THRESHOLD_BREACH":
      return "high";
    case "RATE_OF_CHANGE_SPIKE":
      return "medium";
    case "PATTERN_ABSENCE":
      return "critical";
  }
}

export async function createAnomaly(
  reading: Pick<SensorReading, "sensorId" | "timestamp"> | { sensorId: string },
  type: AnomalyType,
  details: string,
) {
  const suppressed = await checkSuppression(reading.sensorId);
  const anomaly = await anomalyRepo.create({
    sensorId: reading.sensorId,
    type,
    details,
    readingTimestamp: "timestamp" in reading ? reading.timestamp : null,
    suppressed,
  });

  const alert = await alertRepo.create({
    anomalyId: anomaly.id,
    sensorId: anomaly.sensor_id,
    message: details,
    severity: getSeverityForAnomaly(type),
    suppressed,
  });

  if (!suppressed) {
    const sensor = await sensorRepo.findById(anomaly.sensor_id);
    publishDashboardEvent({
      type: "alert.created",
      zoneId: sensor.zone_id,
      payload: { alert },
    });
  }

  return anomaly;
}

export async function updateAlertStatus(
  alertId: string,
  newStatus: AlertStatus,
  userId: string,
) {
  const access = await assertHasAssignedZones(userId);
  const alert = await alertRepo.findByIdForUser(alertId, access);

  if (!validTransitions[alert.status].includes(newStatus)) {
    throw new Error("Invalid status transition");
  }

  const updateData: {
    status: AlertStatus;
    acknowledged_at?: Date;
    resolved_at?: Date;
  } = {
    status: newStatus,
  };

  if (newStatus === "acknowledged") {
    updateData.acknowledged_at = new Date();
  }

  if (newStatus === "resolved") {
    updateData.resolved_at = new Date();
  }

  const updatedAlert = await alertRepo.update(alertId, updateData);
  await auditRepo.create({
    alertId,
    fromStatus: alert.status,
    toStatus: newStatus,
    changedBy: userId,
  });

  const sensor = await sensorRepo.findById(updatedAlert.sensor_id);
  publishDashboardEvent({
    type: "alert.updated",
    zoneId: sensor.zone_id,
    payload: { alert: updatedAlert },
  });

  return { success: true };
}
