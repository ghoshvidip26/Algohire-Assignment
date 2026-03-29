import { suppressionRepo } from "../repositories/suppression.repo";

export type AnomalyType =
  | "THRESHOLD_BREACH"
  | "RATE_OF_CHANGE_SPIKE"
  | "PATTERN_ABSENCE";

export type SensorReading = {
  sensorId: string;
  timestamp: string;
  voltage: number;
  temperature: number;
  current: number;
};

export type SensorRuleConfig = {
  sensorId: string;
  minVoltage: number;
  maxVoltage: number;
  minTemperature: number;
  maxTemperature: number;
  spikeThresholdPercent: number;
};

export type AnomalyRecord = {
  id: string;
  sensorId: string;
  type: AnomalyType;
  readingTimestamp: string | null;
  detectedAt: string;
  details: string;
  suppressed: boolean;
};

export type AlertRecord = {
  id: string;
  anomalyId: string;
  sensorId: string;
  createdAt: string;
  message: string;
  status: "open";
};

const readingStore = new Map<string, SensorReading[]>();
const configStore = new Map<string, SensorRuleConfig>();
const lastSeenStore = new Map<string, string>();
const openAbsenceAnomalies = new Set<string>();

const anomalies: AnomalyRecord[] = [];
const alerts: AlertRecord[] = [];

let nextAnomalyId = 1;
let nextAlertId = 1;

function toIsoString(value: string | number | Date) {
  return new Date(value).toISOString();
}

export function seedSensorConfig(configs: SensorRuleConfig[]) {
  configs.forEach((config) => {
    configStore.set(config.sensorId, config);
  });
}

export function upsertSensorConfig(config: SensorRuleConfig) {
  configStore.set(config.sensorId, config);
}

export async function getSensorConfig(sensorId: string) {
  const config = configStore.get(sensorId);

  if (!config) {
    throw new Error(`Missing sensor config for ${sensorId}`);
  }

  return config;
}

export async function saveReadings(readings: SensorReading[]) {
  readings.forEach((reading) => {
    const sensorReadings = readingStore.get(reading.sensorId) ?? [];
    sensorReadings.push({
      ...reading,
      timestamp: toIsoString(reading.timestamp),
    });
    readingStore.set(reading.sensorId, sensorReadings);
    lastSeenStore.set(reading.sensorId, toIsoString(reading.timestamp));
    openAbsenceAnomalies.delete(reading.sensorId);
  });
}

export async function getLast3Readings(sensorId: string) {
  const sensorReadings = readingStore.get(sensorId) ?? [];
  return sensorReadings.slice(-3);
}

export async function checkSuppression(sensorId: string) {
  return (await suppressionRepo.findActiveBySensorId(sensorId)) !== null;
}

export async function recordAnomaly(input: {
  sensorId: string;
  type: AnomalyType;
  readingTimestamp: string | null;
  details: string;
}) {
  const suppressed = await checkSuppression(input.sensorId);
  const anomaly: AnomalyRecord = {
    id: `ANM-${String(nextAnomalyId++).padStart(5, "0")}`,
    sensorId: input.sensorId,
    type: input.type,
    readingTimestamp: input.readingTimestamp,
    detectedAt: new Date().toISOString(),
    details: input.details,
    suppressed,
  };

  anomalies.unshift(anomaly);

  if (input.type === "PATTERN_ABSENCE") {
    openAbsenceAnomalies.add(input.sensorId);
  }

  return anomaly;
}

export async function recordAlert(input: {
  anomalyId: string;
  sensorId: string;
  message: string;
}) {
  const alert: AlertRecord = {
    id: `ALT-${String(nextAlertId++).padStart(5, "0")}`,
    anomalyId: input.anomalyId,
    sensorId: input.sensorId,
    createdAt: new Date().toISOString(),
    message: input.message,
    status: "open",
  };

  alerts.unshift(alert);
  return alert;
}

export async function getSensorIds() {
  return [...configStore.keys()];
}

export async function getLastSeenAt(sensorId: string) {
  return lastSeenStore.get(sensorId) ?? null;
}

export async function hasOpenAbsenceAnomaly(sensorId: string) {
  return openAbsenceAnomalies.has(sensorId);
}

export async function listAnomalies() {
  return anomalies;
}

export async function listAlerts() {
  return alerts;
}

seedSensorConfig([
  {
    sensorId: "SN-204",
    minVoltage: 220,
    maxVoltage: 240,
    minTemperature: 10,
    maxTemperature: 50,
    spikeThresholdPercent: 20,
  },
  {
    sensorId: "SN-118",
    minVoltage: 220,
    maxVoltage: 238,
    minTemperature: 10,
    maxTemperature: 45,
    spikeThresholdPercent: 15,
  },
  {
    sensorId: "SN-087",
    minVoltage: 218,
    maxVoltage: 235,
    minTemperature: 10,
    maxTemperature: 55,
    spikeThresholdPercent: 12,
  },
  {
    sensorId: "SN-333",
    minVoltage: 210,
    maxVoltage: 240,
    minTemperature: 10,
    maxTemperature: 45,
    spikeThresholdPercent: 10,
  },
]);
