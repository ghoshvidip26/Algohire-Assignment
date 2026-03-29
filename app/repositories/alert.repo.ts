import { query } from "../lib/db";

export type AlertStatus = "open" | "acknowledged" | "resolved";
export type AlertSeverity = "low" | "medium" | "high" | "critical";

export type AlertRecord = {
  id: string;
  anomaly_id: string | null;
  sensor_id: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  suppressed: boolean;
  assigned_to: string | null;
  escalated: boolean;
  created_at: Date;
  acknowledged_at: Date | null;
  resolved_at: Date | null;
};

export type DashboardAlertRecord = AlertRecord & {
  sensor_name: string;
};

type AlertUpdate = Partial<
  Pick<
    AlertRecord,
    "status" | "assigned_to" | "escalated" | "acknowledged_at" | "resolved_at"
  >
>;

async function listAlertsByZoneIds(zoneIds: string[]) {
  const result = await query<AlertRecord>(
    `
      SELECT DISTINCT
        a.id,
        a.anomaly_id,
        a.sensor_id,
        a.message,
        a.severity,
        a.status,
        a.suppressed,
        a.assigned_to,
        a.escalated,
        a.created_at,
        a.acknowledged_at,
        a.resolved_at
      FROM alerts a
      JOIN sensors s ON s.id = a.sensor_id
      WHERE s.zone_id = ANY($1::uuid[])
      ORDER BY a.created_at DESC
    `,
    [zoneIds],
  );

  return result.rows;
}

export const alertRepo = {
  async findById(id: string) {
    const result = await query<AlertRecord>(
      `
        SELECT
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
        FROM alerts
        WHERE id = $1
      `,
      [id],
    );

    const alert = result.rows[0];
    if (!alert) {
      throw new Error(`Alert ${id} not found`);
    }

    return alert;
  },

  async findByIdForUser(id: string, access: { isSupervisor: boolean; zoneIds: string[] }) {
    if (access.isSupervisor) {
      return this.findById(id);
    }

    const result = await query<AlertRecord>(
      `
        SELECT
          a.id,
          a.anomaly_id,
          a.sensor_id,
          a.message,
          a.severity,
          a.status,
          a.suppressed,
          a.assigned_to,
          a.escalated,
          a.created_at,
          a.acknowledged_at,
          a.resolved_at
        FROM alerts a
        JOIN sensors s ON s.id = a.sensor_id
        WHERE a.id = $1
          AND s.zone_id = ANY($2::uuid[])
      `,
      [id, access.zoneIds],
    );

    const alert = result.rows[0];
    if (!alert) {
      throw new Error(`Alert ${id} is outside the user's assigned zones`);
    }

    return alert;
  },

  async getOpenCriticalAlerts() {
    const result = await query<AlertRecord>(
      `
        SELECT
          id,
          anomaly_id,
          sensor_id,
          message,
          severity,
          status,
          assigned_to,
          escalated,
          created_at,
          acknowledged_at,
          resolved_at
        FROM alerts
        WHERE severity = 'critical' AND status = 'open'
        ORDER BY created_at ASC
      `,
    );

    return result.rows;
  },

  async create(input: {
    anomalyId?: string | null;
    sensorId: string;
    message: string;
    severity: AlertSeverity;
    assignedTo?: string | null;
    suppressed?: boolean;
  }) {
    const result = await query<AlertRecord>(
      `
        INSERT INTO alerts (
          anomaly_id,
          sensor_id,
          message,
          severity,
          status,
          suppressed,
          assigned_to,
          escalated
        )
        VALUES ($1, $2, $3, $4, 'open', $5, $6, false)
        RETURNING
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
      `,
      [
        input.anomalyId ?? null,
        input.sensorId,
        input.message,
        input.severity,
        input.assignedTo ?? null,
        input.suppressed ?? false,
      ],
    );

    return result.rows[0];
  },

  async update(id: string, update: AlertUpdate) {
    const fields: string[] = [];
    const values: unknown[] = [];

    Object.entries(update).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      values.push(value);
      fields.push(`${key} = $${values.length}`);
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query<AlertRecord>(
      `
        UPDATE alerts
        SET ${fields.join(", ")}
        WHERE id = $${values.length}
        RETURNING
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
      `,
      values,
    );

    const alert = result.rows[0];
    if (!alert) {
      throw new Error(`Alert ${id} not found`);
    }

    return alert;
  },

  async getByUserZones(access: { isSupervisor: boolean; zoneIds: string[] }) {
    if (access.isSupervisor) {
      const result = await query<AlertRecord>(
        `
          SELECT
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
          FROM alerts
          ORDER BY created_at DESC
        `,
      );

      return result.rows;
    }

    return listAlertsByZoneIds(access.zoneIds);
  },

  async getDashboardAlerts(access: { isSupervisor: boolean; zoneIds: string[] }) {
    if (access.isSupervisor) {
      const result = await query<DashboardAlertRecord>(
        `
          SELECT
            a.id,
            a.anomaly_id,
            a.sensor_id,
            a.message,
            a.severity,
            a.status,
            a.suppressed,
            a.assigned_to,
            a.escalated,
            a.created_at,
            a.acknowledged_at,
            a.resolved_at,
            s.name AS sensor_name
          FROM alerts a
          JOIN sensors s ON s.id = a.sensor_id
          ORDER BY a.created_at DESC
        `,
      );

      return result.rows;
    }

    const result = await query<DashboardAlertRecord>(
      `
        SELECT
          a.id,
          a.anomaly_id,
          a.sensor_id,
          a.message,
          a.severity,
          a.status,
          a.suppressed,
          a.assigned_to,
          a.escalated,
          a.created_at,
          a.acknowledged_at,
          a.resolved_at,
          s.name AS sensor_name
        FROM alerts a
        JOIN sensors s ON s.id = a.sensor_id
        WHERE s.zone_id = ANY($1::uuid[])
        ORDER BY a.created_at DESC
      `,
      [access.zoneIds],
    );

    return result.rows;
  },

  async getDashboardAlertById(id: string) {
    const result = await query<DashboardAlertRecord>(
      `
        SELECT
          a.id,
          a.anomaly_id,
          a.sensor_id,
          a.message,
          a.severity,
          a.status,
          a.suppressed,
          a.assigned_to,
          a.escalated,
          a.created_at,
          a.acknowledged_at,
          a.resolved_at,
          s.name AS sensor_name
        FROM alerts a
        JOIN sensors s ON s.id = a.sensor_id
        WHERE a.id = $1
      `,
      [id],
    );

    const alert = result.rows[0];
    if (!alert) {
      throw new Error(`Alert ${id} not found`);
    }

    return alert;
  },
};
