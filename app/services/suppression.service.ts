import { alertRepo } from "../repositories/alert.repo";
import { sensorRepo } from "../repositories/sensor.repo";
import { suppressionRepo } from "../repositories/suppression.repo";
import { assertHasAssignedZones } from "./authorization.service";

export async function createSuppression(input: {
  sensorId: string;
  userId: string;
  startTime: string;
  endTime: string;
  reason?: string;
}) {
  const access = await assertHasAssignedZones(input.userId);
  await sensorRepo.findByIdForAccess(input.sensorId, access);

  const suppression = await suppressionRepo.create({
    sensorId: input.sensorId,
    createdBy: input.userId,
    startTime: input.startTime,
    endTime: input.endTime,
    reason: input.reason,
  });

  const openAlerts = (await alertRepo.getByUserZones(access)).filter(
    (alert) => alert.sensor_id === input.sensorId && alert.status === "open",
  );

  return {
    suppression,
    handlingDecision:
      "Existing open alerts remain open. The suppression window only prevents new notifications and escalations for anomalies detected during the active window.",
    openAlertCount: openAlerts.length,
  };
}
