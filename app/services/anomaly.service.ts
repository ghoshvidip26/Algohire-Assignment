import { createAnomaly } from "./alert.service";
import {
  getLastSeenAt,
  getSensorIds,
  hasOpenAbsenceAnomaly,
  type SensorReading,
} from "./monitoring-store";
import { checkSpike, checkThreshold } from "../utils/calculations";
import { deriveSensorStatus, syncSensorState } from "./sensor-state.service";

const PATTERN_ABSENCE_WINDOW_MS = 2 * 60 * 1000;

export async function runAnomalyDetection(readings: SensorReading[]) {
  for (const reading of readings) {
    const thresholdResult = await checkThreshold(reading);
    if (thresholdResult.triggered) {
      await createAnomaly(
        reading,
        "THRESHOLD_BREACH",
        thresholdResult.details,
      );
    }

    const spikeResult = await checkSpike(reading);
    if (spikeResult.triggered) {
      await createAnomaly(
        reading,
        "RATE_OF_CHANGE_SPIKE",
        spikeResult.details,
      );
    }

    await syncSensorState(
      reading.sensorId,
      deriveSensorStatus({
        reading,
        thresholdTriggered: thresholdResult.triggered,
        spikeTriggered: spikeResult.triggered,
      }),
      reading.timestamp,
    );
  }
}

export async function detectPatternAbsence(now = Date.now()) {
  const sensorIds = await getSensorIds();

  for (const sensorId of sensorIds) {
    const lastSeenAt = await getLastSeenAt(sensorId);
    const alreadyOpen = await hasOpenAbsenceAnomaly(sensorId);

    if (!lastSeenAt || alreadyOpen) {
      continue;
    }

    const elapsedMs = now - new Date(lastSeenAt).getTime();

    if (elapsedMs > PATTERN_ABSENCE_WINDOW_MS) {
      await createAnomaly(
        { sensorId },
        "PATTERN_ABSENCE",
        `sensor has not reported for ${Math.floor(elapsedMs / 1000)} seconds`,
      );
      await syncSensorState(sensorId, "silent");
    }
  }
}
