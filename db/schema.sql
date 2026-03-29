CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('operator', 'supervisor')),
  is_on_call BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_zones (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, zone_id)
);

CREATE TABLE IF NOT EXISTS sensors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  zone_id UUID NOT NULL REFERENCES zones(id),
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical', 'silent')),
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id TEXT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  voltage NUMERIC NOT NULL,
  temperature NUMERIC NOT NULL,
  current NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id TEXT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  details TEXT NOT NULL,
  reading_timestamp TIMESTAMPTZ,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  suppressed BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anomaly_id UUID REFERENCES anomalies(id) ON DELETE SET NULL,
  sensor_id TEXT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('open', 'acknowledged', 'resolved')),
  suppressed BOOLEAN NOT NULL DEFAULT false,
  assigned_to UUID REFERENCES users(id),
  escalated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS alert_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL CHECK (from_status IN ('open', 'acknowledged', 'resolved')),
  to_status TEXT NOT NULL CHECK (to_status IN ('open', 'acknowledged', 'resolved')),
  changed_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  escalated_to UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sensor_suppressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id TEXT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_alerts_open_critical
  ON alerts (created_at)
  WHERE severity = 'critical' AND status = 'open';

CREATE INDEX IF NOT EXISTS idx_sensors_zone_id ON sensors (zone_id);
CREATE INDEX IF NOT EXISTS idx_readings_sensor_id_recorded_at
  ON readings (sensor_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomalies_sensor_id_detected_at
  ON anomalies (sensor_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_suppressions_sensor_window
  ON sensor_suppressions (sensor_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_alerts_anomaly ON alerts(anomaly_id);
