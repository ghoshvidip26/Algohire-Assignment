import { query } from "../lib/db";

export type SensorStatus = "healthy" | "warning" | "critical" | "silent";

export type SensorRecord = {
  id: string;
  name: string;
  location: string;
  zone_id: string;
  status: SensorStatus;
  last_seen_at: Date | null;
  created_at: Date;
};

export type DashboardSensorRecord = {
  id: string;
  name: string;
  location: string;
  status: SensorStatus;
  voltage: number;
  current: number;
  temperature: number;
  trend: number[];
};

type SensorAccess = {
  isSupervisor: boolean;
  zoneIds: string[];
};

function buildZoneFilter(access: SensorAccess, offset = 1) {
  if (access.isSupervisor) {
    return {
      clause: "",
      params: [] as unknown[],
    };
  }

  return {
    clause: `WHERE s.zone_id = ANY($${offset}::uuid[])`,
    params: [access.zoneIds],
  };
}

export const sensorRepo = {
  async getByUserZones(access: { isSupervisor: boolean; zoneIds: string[] }) {
    if (access.isSupervisor) {
      const res = await query(`SELECT * FROM sensors`);
      return res.rows;
    }

    const res = await query(
      `
      SELECT *
      FROM sensors
      WHERE zone_id = ANY($1::uuid[])
      `,
      [access.zoneIds],
    );
    return res.rows;
  },
  async getByAccess(access: SensorAccess) {
    const filter = buildZoneFilter(access);
    const result = await query<SensorRecord>(
      `
        SELECT
          s.id,
          s.name,
          s.location,
          s.zone_id,
          s.status,
          s.last_seen_at,
          s.created_at
        FROM sensors s
        ${filter.clause}
        ORDER BY s.id ASC
      `,
      filter.params,
    );

    return result.rows;
  },

  async findById(sensorId: string) {
    const result = await query<SensorRecord>(
      `
        SELECT
          s.id,
          s.name,
          s.location,
          s.zone_id,
          s.status,
          s.last_seen_at,
          s.created_at
        FROM sensors s
        WHERE s.id = $1
      `,
      [sensorId],
    );

    const sensor = result.rows[0];
    if (!sensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }

    return sensor;
  },

  async findByIdForAccess(sensorId: string, access: SensorAccess) {
    if (access.isSupervisor) {
      return this.findById(sensorId);
    }

    const result = await query<SensorRecord>(
      `
        SELECT
          s.id,
          s.name,
          s.location,
          s.zone_id,
          s.status,
          s.last_seen_at,
          s.created_at
        FROM sensors s
        WHERE s.id = $1
          AND s.zone_id = ANY($2::uuid[])
      `,
      [sensorId, access.zoneIds],
    );

    const sensor = result.rows[0];
    if (!sensor) {
      throw new Error(
        `Sensor ${sensorId} is outside the user's assigned zones`,
      );
    }

    return sensor;
  },

  async updateState(
    sensorId: string,
    update: Partial<Pick<SensorRecord, "status" | "last_seen_at">>,
  ) {
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
      return this.findById(sensorId);
    }

    values.push(sensorId);
    const result = await query<SensorRecord>(
      `
        UPDATE sensors
        SET ${fields.join(", ")}
        WHERE id = $${values.length}
        RETURNING
          id,
          name,
          location,
          zone_id,
          status,
          last_seen_at,
          created_at
      `,
      values,
    );

    const sensor = result.rows[0];
    if (!sensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }

    return sensor;
  },

  async getDashboardSensors(access: SensorAccess) {
    const filter = buildZoneFilter(access);
    const result = await query<{
      id: string;
      name: string;
      location: string;
      status: SensorStatus;
      voltage: string | null;
      current: string | null;
      temperature: string | null;
      trend: number[] | null;
    }>(
      `
        SELECT
          s.id,
          s.name,
          s.location,
          s.status,
          latest.voltage::text AS voltage,
          latest.current::text AS current,
          latest.temperature::text AS temperature,
          trend.points AS trend
        FROM sensors s
        LEFT JOIN LATERAL (
          SELECT
            r.voltage,
            r.current,
            r.temperature
          FROM readings r
          WHERE r.sensor_id = s.id
          ORDER BY r.recorded_at DESC
          LIMIT 1
        ) latest ON true
        LEFT JOIN LATERAL (
          SELECT ARRAY(
            SELECT COALESCE(inner_r.temperature, 0)::int
            FROM (
              SELECT r.temperature, r.recorded_at
              FROM readings r
              WHERE r.sensor_id = s.id
              ORDER BY r.recorded_at DESC
              LIMIT 7
            ) inner_r
            ORDER BY inner_r.recorded_at ASC
          ) AS points
        ) trend ON true
        ${filter.clause}
        ORDER BY s.id ASC
      `,
      filter.params,
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      status: row.status,
      voltage: Number(row.voltage ?? 0),
      current: Number(row.current ?? 0),
      temperature: Number(row.temperature ?? 0),
      trend: row.trend ?? [],
    })) satisfies DashboardSensorRecord[];
  },
};
