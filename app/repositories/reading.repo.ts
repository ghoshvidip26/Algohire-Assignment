import { query } from "../lib/db";
import type { SensorReading } from "../services/monitoring-store";

export type ReadingRecord = {
  id: string;
  sensor_id: string;
  voltage: number;
  temperature: number;
  current: number;
  recorded_at: Date;
  created_at: Date;
};

type AccessScope = {
  isSupervisor: boolean;
  zoneIds: string[];
};

export type HistoricalReadingRow = ReadingRecord & {
  anomaly_ids: string[] | null;
  anomaly_types: string[] | null;
  alert_ids: string[] | null;
};

export const readingRepo = {
  async insertMany(readings: SensorReading[]) {
    if (readings.length === 0) {
      return [];
    }

    const values: unknown[] = [];
    const tuples = readings.map((reading, index) => {
      const base = index * 5;
      values.push(
        reading.sensorId,
        reading.voltage,
        reading.temperature,
        reading.current,
        new Date(reading.timestamp),
      );

      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
    });

    const result = await query<ReadingRecord>(
      `
        INSERT INTO readings (
          sensor_id,
          voltage,
          temperature,
          current,
          recorded_at
        )
        VALUES ${tuples.join(", ")}
        RETURNING
          id,
          sensor_id,
          voltage,
          temperature,
          current,
          recorded_at,
          created_at
      `,
      values,
    );

    return result.rows;
  },

  async getByAccess(access: AccessScope) {
    if (access.isSupervisor) {
      const result = await query<ReadingRecord>(
        `
          SELECT
            r.id,
            r.sensor_id,
            r.voltage,
            r.temperature,
            r.current,
            r.recorded_at,
            r.created_at
          FROM readings r
          ORDER BY r.recorded_at DESC
        `,
      );

      return result.rows;
    }

    const result = await query<ReadingRecord>(
      `
        SELECT
          r.id,
          r.sensor_id,
          r.voltage,
          r.temperature,
          r.current,
          r.recorded_at,
          r.created_at
        FROM readings r
        JOIN sensors s ON s.id = r.sensor_id
        WHERE s.zone_id = ANY($1::uuid[])
        ORDER BY r.recorded_at DESC
      `,
      [access.zoneIds],
    );

    return result.rows;
  },

  async getSensorHistory(input: {
    sensorId: string;
    from: string;
    to: string;
    page: number;
    pageSize: number;
  }) {
    const offset = (input.page - 1) * input.pageSize;
    const params = [
      input.sensorId,
      new Date(input.from),
      new Date(input.to),
      input.pageSize,
      offset,
    ];

    const rowsPromise = query<HistoricalReadingRow>(
      `
        SELECT
          r.id,
          r.sensor_id,
          r.voltage,
          r.temperature,
          r.current,
          r.recorded_at,
          r.created_at,
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT a.id::text), NULL) AS anomaly_ids,
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT a.type), NULL) AS anomaly_types,
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT al.id::text), NULL) AS alert_ids
        FROM readings r
        LEFT JOIN anomalies a
          ON a.sensor_id = r.sensor_id
         AND a.reading_timestamp = r.recorded_at
        LEFT JOIN alerts al
          ON al.anomaly_id = a.id
        WHERE r.sensor_id = $1
          AND r.recorded_at >= $2
          AND r.recorded_at <= $3
        GROUP BY r.id
        ORDER BY r.recorded_at DESC
        LIMIT $4
        OFFSET $5
      `,
      params,
    );

    const countPromise = query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM readings
        WHERE sensor_id = $1
          AND recorded_at >= $2
          AND recorded_at <= $3
      `,
      params.slice(0, 3),
    );

    const [rowsResult, countResult] = await Promise.all([rowsPromise, countPromise]);

    return {
      rows: rowsResult.rows,
      total: Number(countResult.rows[0]?.count ?? 0),
    };
  },
};
