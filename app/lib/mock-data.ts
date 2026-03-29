export type SensorStatus = "healthy" | "warning" | "critical" | "silent";

export type Sensor = {
  id: string;
  name: string;
  location: string;
  status: SensorStatus;
  voltage: number;
  current: number;
  temperature: number;
  trend: number[];
};

export type AlertSeverity = "low" | "medium" | "high";
export type AlertState = "open" | "acknowledged" | "resolved";

export type GridAlert = {
  id: string;
  sensorId: string;
  sensorName: string;
  severity: AlertSeverity;
  status: AlertState;
  message: string;
  timestamp: string;
};

export const sensors: Sensor[] = [
  {
    id: "SN-204",
    name: "Substation Alpha",
    location: "North Grid",
    status: "healthy",
    voltage: 231,
    current: 18.4,
    temperature: 36,
    trend: [68, 70, 71, 69, 73, 75, 76],
  },
  {
    id: "SN-118",
    name: "Feeder Bravo",
    location: "Industrial Park",
    status: "warning",
    voltage: 224,
    current: 22.1,
    temperature: 47,
    trend: [41, 46, 52, 56, 60, 63, 61],
  },
  {
    id: "SN-087",
    name: "Transformer Delta",
    location: "East Corridor",
    status: "critical",
    voltage: 216,
    current: 29.7,
    temperature: 63,
    trend: [55, 58, 62, 66, 71, 74, 79],
  },
  {
    id: "SN-333",
    name: "Relay Echo",
    location: "South Annex",
    status: "silent",
    voltage: 0,
    current: 0,
    temperature: 0,
    trend: [22, 18, 11, 9, 4, 0, 0],
  },
];

export const alerts: GridAlert[] = [
  {
    id: "ALT-9001",
    sensorId: "SN-087",
    sensorName: "Transformer Delta",
    severity: "high",
    status: "open",
    message: "Temperature crossed threshold for 12 minutes.",
    timestamp: "2 min ago",
  },
  {
    id: "ALT-9002",
    sensorId: "SN-118",
    sensorName: "Feeder Bravo",
    severity: "medium",
    status: "acknowledged",
    message: "Current variance exceeded expected baseline.",
    timestamp: "18 min ago",
  },
  {
    id: "ALT-9003",
    sensorId: "SN-333",
    sensorName: "Relay Echo",
    severity: "low",
    status: "resolved",
    message: "Sensor heartbeat restored after brief outage.",
    timestamp: "54 min ago",
  },
];
