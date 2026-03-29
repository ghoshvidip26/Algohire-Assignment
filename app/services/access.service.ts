import { alertRepo } from "../repositories/alert.repo";
import { readingRepo } from "../repositories/reading.repo";
import { sensorRepo } from "../repositories/sensor.repo";
import { assertHasAssignedZones } from "./authorization.service";

export async function getUserScopedData(userId: string) {
  const access = await assertHasAssignedZones(userId);
  const [alerts, sensors, readings] = await Promise.all([
    alertRepo.getByUserZones(access),
    sensorRepo.getByAccess(access),
    readingRepo.getByAccess(access),
  ]);

  return {
    alerts,
    sensors,
    readings,
  };
}
