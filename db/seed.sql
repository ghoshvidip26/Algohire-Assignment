INSERT INTO zones (id, name)
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'North Grid'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'Industrial Park'),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc3', 'East Corridor'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd4', 'South Annex')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name;

INSERT INTO users (id, name, email, role, is_on_call)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'On-call Supervisor', 'supervisor@example.com', 'supervisor', true),
  ('22222222-2222-4222-8222-222222222222', 'Grid Operator', 'operator@example.com', 'operator', false)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_on_call = EXCLUDED.is_on_call;

INSERT INTO user_zones (user_id, zone_id)
VALUES
  ('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  ('22222222-2222-4222-8222-222222222222', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'),
  ('22222222-2222-4222-8222-222222222222', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3'),
  ('22222222-2222-4222-8222-222222222222', 'dddddddd-dddd-4ddd-8ddd-ddddddddddd4')
ON CONFLICT DO NOTHING;

INSERT INTO sensors (id, name, location, zone_id, status)
VALUES
  ('SN-204', 'Substation Alpha', 'North Grid', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'healthy'),
  ('SN-118', 'Feeder Bravo', 'Industrial Park', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'warning'),
  ('SN-087', 'Transformer Delta', 'East Corridor', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3', 'critical'),
  ('SN-333', 'Relay Echo', 'South Annex', 'dddddddd-dddd-4ddd-8ddd-ddddddddddd4', 'silent')
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  zone_id = EXCLUDED.zone_id,
  status = EXCLUDED.status;

INSERT INTO readings (sensor_id, voltage, temperature, current, recorded_at)
VALUES
  ('SN-204', 228, 68, 18.0, NOW() - INTERVAL '42 minutes'),
  ('SN-204', 229, 70, 18.1, NOW() - INTERVAL '36 minutes'),
  ('SN-204', 230, 71, 18.2, NOW() - INTERVAL '30 minutes'),
  ('SN-204', 229, 69, 18.1, NOW() - INTERVAL '24 minutes'),
  ('SN-204', 231, 73, 18.3, NOW() - INTERVAL '18 minutes'),
  ('SN-204', 232, 75, 18.4, NOW() - INTERVAL '12 minutes'),
  ('SN-204', 231, 76, 18.4, NOW() - INTERVAL '6 minutes'),
  ('SN-118', 221, 41, 20.2, NOW() - INTERVAL '42 minutes'),
  ('SN-118', 222, 46, 20.8, NOW() - INTERVAL '36 minutes'),
  ('SN-118', 223, 52, 21.2, NOW() - INTERVAL '30 minutes'),
  ('SN-118', 223, 56, 21.6, NOW() - INTERVAL '24 minutes'),
  ('SN-118', 224, 60, 21.8, NOW() - INTERVAL '18 minutes'),
  ('SN-118', 224, 63, 22.0, NOW() - INTERVAL '12 minutes'),
  ('SN-118', 224, 61, 22.1, NOW() - INTERVAL '6 minutes'),
  ('SN-087', 217, 55, 27.0, NOW() - INTERVAL '42 minutes'),
  ('SN-087', 217, 58, 27.8, NOW() - INTERVAL '36 minutes'),
  ('SN-087', 216, 62, 28.4, NOW() - INTERVAL '30 minutes'),
  ('SN-087', 216, 66, 28.9, NOW() - INTERVAL '24 minutes'),
  ('SN-087', 216, 71, 29.2, NOW() - INTERVAL '18 minutes'),
  ('SN-087', 216, 74, 29.5, NOW() - INTERVAL '12 minutes'),
  ('SN-087', 216, 79, 29.7, NOW() - INTERVAL '6 minutes'),
  ('SN-333', 22, 22, 1.6, NOW() - INTERVAL '42 minutes'),
  ('SN-333', 18, 18, 1.2, NOW() - INTERVAL '36 minutes'),
  ('SN-333', 11, 11, 0.7, NOW() - INTERVAL '30 minutes'),
  ('SN-333', 9, 9, 0.5, NOW() - INTERVAL '24 minutes'),
  ('SN-333', 4, 4, 0.2, NOW() - INTERVAL '18 minutes'),
  ('SN-333', 0, 0, 0.0, NOW() - INTERVAL '12 minutes'),
  ('SN-333', 0, 0, 0.0, NOW() - INTERVAL '6 minutes');

INSERT INTO anomalies (id, sensor_id, type, details, reading_timestamp, suppressed, detected_at)
VALUES
  ('aaaaaaaa-1111-4111-8111-111111111111', 'SN-087', 'THRESHOLD_BREACH', 'Temperature crossed threshold for 12 minutes.', NOW() - INTERVAL '2 minutes', false, NOW() - INTERVAL '2 minutes'),
  ('bbbbbbbb-2222-4222-8222-222222222222', 'SN-118', 'RATE_OF_CHANGE_SPIKE', 'Current variance exceeded expected baseline.', NOW() - INTERVAL '18 minutes', false, NOW() - INTERVAL '18 minutes'),
  ('cccccccc-3333-4333-8333-333333333333', 'SN-333', 'PATTERN_ABSENCE', 'Sensor heartbeat restored after brief outage.', NOW() - INTERVAL '54 minutes', false, NOW() - INTERVAL '54 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO alerts (
  id,
  anomaly_id,
  sensor_id,
  message,
  severity,
  status,
  suppressed,
  assigned_to,
  escalated,
  created_at,
  acknowledged_at,
  resolved_at
)
VALUES
  ('dddddddd-4444-4444-8444-444444444444', 'aaaaaaaa-1111-4111-8111-111111111111', 'SN-087', 'Temperature crossed threshold for 12 minutes.', 'high', 'open', false, '22222222-2222-4222-8222-222222222222', false, NOW() - INTERVAL '2 minutes', NULL, NULL),
  ('eeeeeeee-5555-4555-8555-555555555555', 'bbbbbbbb-2222-4222-8222-222222222222', 'SN-118', 'Current variance exceeded expected baseline.', 'medium', 'acknowledged', false, '22222222-2222-4222-8222-222222222222', false, NOW() - INTERVAL '18 minutes', NOW() - INTERVAL '15 minutes', NULL),
  ('ffffffff-6666-4666-8666-666666666666', 'cccccccc-3333-4333-8333-333333333333', 'SN-333', 'Sensor heartbeat restored after brief outage.', 'low', 'resolved', false, '22222222-2222-4222-8222-222222222222', false, NOW() - INTERVAL '54 minutes', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO UPDATE
SET
  anomaly_id = EXCLUDED.anomaly_id,
  sensor_id = EXCLUDED.sensor_id,
  message = EXCLUDED.message,
  severity = EXCLUDED.severity,
  status = EXCLUDED.status,
  suppressed = EXCLUDED.suppressed,
  assigned_to = EXCLUDED.assigned_to,
  escalated = EXCLUDED.escalated,
  created_at = EXCLUDED.created_at,
  acknowledged_at = EXCLUDED.acknowledged_at,
  resolved_at = EXCLUDED.resolved_at;
