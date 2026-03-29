import { detectPatternAbsence, runAnomalyDetection } from "../services/anomaly.service";
import type { SensorReading } from "../services/monitoring-store";

let patternAbsenceMonitor: ReturnType<typeof setInterval> | null = null;

export function processBatch(readings: SensorReading[]) {
  setImmediate(() => {
    void runAnomalyDetection(readings);
  });
}

export function startPatternAbsenceMonitor(intervalMs = 15_000) {
  if (patternAbsenceMonitor) {
    return patternAbsenceMonitor;
  }

  patternAbsenceMonitor = setInterval(() => {
    void detectPatternAbsence();
  }, intervalMs);

  return patternAbsenceMonitor;
}

export function stopPatternAbsenceMonitor() {
  if (!patternAbsenceMonitor) {
    return;
  }

  clearInterval(patternAbsenceMonitor);
  patternAbsenceMonitor = null;
}
