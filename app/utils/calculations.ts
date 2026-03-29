import {
  getLast3Readings,
  getSensorConfig,
  type SensorReading,
} from "../services/monitoring-store";

export async function checkThreshold(reading: SensorReading) {
  const config = await getSensorConfig(reading.sensorId);
  const breaches: string[] = [];

  if (reading.temperature > config.maxTemperature) {
    breaches.push(
      `temperature ${reading.temperature} exceeded max ${config.maxTemperature}`,
    );
  }

  if (reading.temperature < config.minTemperature) {
    breaches.push(
      `temperature ${reading.temperature} fell below min ${config.minTemperature}`,
    );
  }

  if (reading.voltage > config.maxVoltage) {
    breaches.push(`voltage ${reading.voltage} exceeded max ${config.maxVoltage}`);
  }

  if (reading.voltage < config.minVoltage) {
    breaches.push(`voltage ${reading.voltage} fell below min ${config.minVoltage}`);
  }

  return {
    triggered: breaches.length > 0,
    details: breaches.join("; "),
  };
}

export async function checkSpike(reading: SensorReading) {
  const last3 = await getLast3Readings(reading.sensorId);

  if (last3.length < 3) {
    return {
      triggered: false,
      details: "insufficient reading history",
    };
  }

  const avg =
    last3.reduce((sum, previousReading) => sum + previousReading.temperature, 0) /
    last3.length;

  if (avg === 0) {
    return {
      triggered: false,
      details: "previous average is zero",
    };
  }

  const changePercent = (Math.abs(reading.temperature - avg) / avg) * 100;
  const config = await getSensorConfig(reading.sensorId);

  return {
    triggered: changePercent > config.spikeThresholdPercent,
    details: `temperature changed ${changePercent.toFixed(2)}% from 3-reading average ${avg.toFixed(2)} with threshold ${config.spikeThresholdPercent}%`,
  };
}
